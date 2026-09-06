import type { Pool, PoolClient } from "pg";
import { randomUUID } from "crypto";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";
import { sendOryCMSEmail } from "@/email";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OryCMSBookingStatus = "confirmed" | "canceled" | "completed";

export interface OryCMSBookingDay {
  weekday: number; // 0 = Sunday .. 6 = Saturday
  enabled: boolean;
  startTime: string; // "HH:mm", interpreted in the business timezone
  endTime: string;
}

export interface OryCMSBookingSettings {
  slotDurationMinutes: number;
  bufferMinutes: number;
  bookingWindowDays: number;
  minNoticeHours: number;
  timezone: string;
}

export interface OryCMSBookingAvailability {
  days: OryCMSBookingDay[];
  settings: OryCMSBookingSettings;
}

export interface OryCMSBookingAvailabilityInput {
  days: OryCMSBookingDay[];
  settings: Partial<OryCMSBookingSettings>;
}

export interface OryCMSBookingSlot {
  start: string; // ISO 8601 UTC
  end: string;
}

export interface OryCMSBookingRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  startAt: string;
  endAt: string;
  visitorTimezone: string | null;
  meetingUrl: string | null;
  status: OryCMSBookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OryCMSBookingInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  start: string; // ISO 8601 UTC
  end: string;
  visitorTimezone?: string | null;
}

export interface OryCMSBookingFilter {
  status?: OryCMSBookingStatus;
  from?: string;
  to?: string;
}

/**
 * OrynticLabs runs on Asia/Kolkata, a fixed UTC+5:30 offset with no DST — a
 * proper IANA tz lookup isn't needed for a single-business-timezone
 * scheduler, so wall-clock day/slot boundaries are computed with this fixed
 * offset rather than pulling in a new timezone dependency.
 */
const BUSINESS_TZ_OFFSET_MINUTES = 330;

// ── Schema ─────────────────────────────────────────────────────────────────────

const ENSURE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS orycms_booking_availability_days (
  weekday     SMALLINT PRIMARY KEY,
  enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  start_time  TEXT NOT NULL DEFAULT '10:00',
  end_time    TEXT NOT NULL DEFAULT '18:00'
);
CREATE TABLE IF NOT EXISTS orycms_booking_settings (
  id                      SMALLINT PRIMARY KEY DEFAULT 1,
  slot_duration_minutes   INTEGER NOT NULL DEFAULT 30,
  buffer_minutes          INTEGER NOT NULL DEFAULT 15,
  booking_window_days     INTEGER NOT NULL DEFAULT 21,
  min_notice_hours        INTEGER NOT NULL DEFAULT 4,
  timezone                TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  CONSTRAINT orycms_booking_settings_singleton CHECK (id = 1)
);
CREATE TABLE IF NOT EXISTS orycms_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  company           TEXT,
  notes             TEXT,
  start_at          TIMESTAMPTZ NOT NULL,
  end_at            TIMESTAMPTZ NOT NULL,
  visitor_timezone  TEXT,
  meeting_url       TEXT,
  status            TEXT NOT NULL DEFAULT 'confirmed',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_oc_bookings_start_at ON orycms_bookings (start_at);
CREATE INDEX IF NOT EXISTS idx_oc_bookings_status_start ON orycms_bookings (status, start_at);
`;

const DEFAULT_DAYS: OryCMSBookingDay[] = [
  { weekday: 0, enabled: false, startTime: "10:00", endTime: "18:00" },
  { weekday: 1, enabled: true, startTime: "10:00", endTime: "18:00" },
  { weekday: 2, enabled: true, startTime: "10:00", endTime: "18:00" },
  { weekday: 3, enabled: true, startTime: "10:00", endTime: "18:00" },
  { weekday: 4, enabled: true, startTime: "10:00", endTime: "18:00" },
  { weekday: 5, enabled: true, startTime: "10:00", endTime: "18:00" },
  { weekday: 6, enabled: false, startTime: "10:00", endTime: "18:00" },
];

async function ensureTables(pool: Pool): Promise<void> {
  await pool.query(ENSURE_TABLES_SQL);

  const dayCount = await pool.query<{ count: string }>(`SELECT COUNT(*) FROM orycms_booking_availability_days`);
  if (Number(dayCount.rows[0]?.count ?? 0) === 0) {
    for (const d of DEFAULT_DAYS) {
      await pool.query(
        `INSERT INTO orycms_booking_availability_days (weekday, enabled, start_time, end_time)
         VALUES ($1, $2, $3, $4) ON CONFLICT (weekday) DO NOTHING`,
        [d.weekday, d.enabled, d.startTime, d.endTime],
      );
    }
  }

  await pool.query(
    `INSERT INTO orycms_booking_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`,
  );
}

// ── Row → model ───────────────────────────────────────────────────────────────

interface BookingRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  start_at: string;
  end_at: string;
  visitor_timezone: string | null;
  meeting_url: string | null;
  status: OryCMSBookingStatus;
  created_at: string;
  updated_at: string;
}

function rowToBooking(row: BookingRow): OryCMSBookingRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    notes: row.notes,
    startAt: row.start_at,
    endAt: row.end_at,
    visitorTimezone: row.visitor_timezone,
    meetingUrl: row.meeting_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface DayRow {
  weekday: number;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

interface SettingsRow {
  slot_duration_minutes: number;
  buffer_minutes: number;
  booking_window_days: number;
  min_notice_hours: number;
  timezone: string;
}

// ── Availability ─────────────────────────────────────────────────────────────

export async function getOryCMSBookingAvailability(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingAvailability> {
  await ensureTables(pool);
  const daysResult = await pool.query<DayRow>(
    `SELECT * FROM orycms_booking_availability_days ORDER BY weekday ASC`,
  );
  const settingsResult = await pool.query<SettingsRow>(
    `SELECT * FROM orycms_booking_settings WHERE id = 1`,
  );
  const s = settingsResult.rows[0];
  return {
    days: daysResult.rows.map((r) => ({
      weekday: r.weekday,
      enabled: r.enabled,
      startTime: r.start_time,
      endTime: r.end_time,
    })),
    settings: {
      slotDurationMinutes: s?.slot_duration_minutes ?? 30,
      bufferMinutes: s?.buffer_minutes ?? 15,
      bookingWindowDays: s?.booking_window_days ?? 21,
      minNoticeHours: s?.min_notice_hours ?? 4,
      timezone: s?.timezone ?? "Asia/Kolkata",
    },
  };
}

export async function updateOryCMSBookingAvailability(
  input: OryCMSBookingAvailabilityInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingAvailability> {
  await ensureTables(pool);

  for (const d of input.days) {
    await pool.query(
      `INSERT INTO orycms_booking_availability_days (weekday, enabled, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (weekday) DO UPDATE SET enabled = EXCLUDED.enabled, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time`,
      [d.weekday, d.enabled, d.startTime, d.endTime],
    );
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const fieldMap: Record<string, unknown> = {
    slot_duration_minutes: input.settings.slotDurationMinutes,
    buffer_minutes: input.settings.bufferMinutes,
    booking_window_days: input.settings.bookingWindowDays,
    min_notice_hours: input.settings.minNoticeHours,
    timezone: input.settings.timezone,
  };
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      sets.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (sets.length > 0) {
    await pool.query(`UPDATE orycms_booking_settings SET ${sets.join(", ")} WHERE id = 1`, values);
  }

  return getOryCMSBookingAvailability(pool);
}

// ── Slot computation ─────────────────────────────────────────────────────────

/** "HH:mm" + a Y/M/D (business-local) → the equivalent instant in UTC, given the fixed business offset. */
function businessLocalToUtc(year: number, month: number, day: number, hh: number, mm: number): Date {
  // Date.UTC treats its inputs as already-UTC wall-clock fields; subtracting
  // the business offset converts "this wall-clock time in the business tz"
  // into the correct UTC instant.
  return new Date(Date.UTC(year, month, day, hh, mm) - BUSINESS_TZ_OFFSET_MINUTES * 60_000);
}

/** The business-local (Y, M, D, weekday) for a given instant. */
function toBusinessLocalParts(date: Date): { year: number; month: number; day: number; weekday: number } {
  const shifted = new Date(date.getTime() + BUSINESS_TZ_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

function parseHHmm(value: string): { hh: number; mm: number } {
  const [hh, mm] = value.split(":").map((n) => Number(n));
  return { hh: hh || 0, mm: mm || 0 };
}

/**
 * Pure slot computation for one business-local calendar date, given the
 * weekly availability config and the list of already-confirmed bookings
 * that could overlap that date. Kept dependency-free (no DB access) so it
 * can be exercised the same way at both read time (GET slots) and
 * write time (POST re-validation).
 */
export function computeSlotsForDate(
  dateISO: string,
  availability: OryCMSBookingAvailability,
  existingBookings: { startAt: string; endAt: string }[],
): OryCMSBookingSlot[] {
  const [y, m, d] = dateISO.split("-").map((n) => Number(n));
  if (!y || !m || !d) return [];

  // Determine the target date's weekday by treating noon business-local
  // time as a safe, DST-and-boundary-immune anchor for that calendar day.
  const anchor = businessLocalToUtc(y, m - 1, d, 12, 0);
  const { weekday } = toBusinessLocalParts(anchor);
  const dayConfig = availability.days.find((day) => day.weekday === weekday);
  if (!dayConfig || !dayConfig.enabled) return [];

  const now = new Date();
  const minNoticeAt = new Date(now.getTime() + availability.settings.minNoticeHours * 60 * 60_000);
  const windowEndAt = new Date(now.getTime() + availability.settings.bookingWindowDays * 24 * 60 * 60_000);

  const { hh: startHH, mm: startMM } = parseHHmm(dayConfig.startTime);
  const { hh: endHH, mm: endMM } = parseHHmm(dayConfig.endTime);
  const dayStartUtc = businessLocalToUtc(y, m - 1, d, startHH, startMM);
  const dayEndUtc = businessLocalToUtc(y, m - 1, d, endHH, endMM);

  const slotMs = availability.settings.slotDurationMinutes * 60_000;
  const bufferMs = availability.settings.bufferMinutes * 60_000;

  const busy = existingBookings.map((b) => ({
    start: new Date(b.startAt).getTime() - bufferMs,
    end: new Date(b.endAt).getTime() + bufferMs,
  }));

  const slots: OryCMSBookingSlot[] = [];
  for (let start = dayStartUtc.getTime(); start + slotMs <= dayEndUtc.getTime(); start += slotMs) {
    const end = start + slotMs;
    if (start < minNoticeAt.getTime()) continue;
    if (start > windowEndAt.getTime()) continue;
    const overlaps = busy.some((b) => start < b.end && end > b.start);
    if (overlaps) continue;
    slots.push({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  }
  return slots;
}

export async function getOryCMSAvailableSlots(
  dateISO: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingSlot[]> {
  await ensureTables(pool);
  const availability = await getOryCMSBookingAvailability(pool);

  const [y, m, d] = dateISO.split("-").map((n) => Number(n));
  if (!y || !m || !d) return [];

  // Widen the query window by a day on each side so bookings that started
  // the previous business-local day but overlap into this one (or vice
  // versa near midnight) are still excluded from the busy set.
  const rangeStart = businessLocalToUtc(y, m - 1, d - 1, 0, 0);
  const rangeEnd = businessLocalToUtc(y, m - 1, d + 1, 23, 59);

  const result = await pool.query<{ start_at: string; end_at: string }>(
    `SELECT start_at, end_at FROM orycms_bookings
     WHERE status = 'confirmed' AND start_at < $2 AND end_at > $1`,
    [rangeStart.toISOString(), rangeEnd.toISOString()],
  );

  return computeSlotsForDate(
    dateISO,
    availability,
    result.rows.map((r) => ({ startAt: r.start_at, endAt: r.end_at })),
  );
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function listOryCMSBookings(
  filter: OryCMSBookingFilter = {},
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingRecord[]> {
  await ensureTables(pool);
  const conditions: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (filter.status) {
    conditions.push(`status = $${i++}`);
    values.push(filter.status);
  }
  if (filter.from) {
    conditions.push(`start_at >= $${i++}`);
    values.push(filter.from);
  }
  if (filter.to) {
    conditions.push(`start_at <= $${i++}`);
    values.push(filter.to);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query<BookingRow>(
    `SELECT * FROM orycms_bookings ${where} ORDER BY start_at ASC`,
    values,
  );
  return result.rows.map(rowToBooking);
}

export async function getOryCMSBooking(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingRecord> {
  await ensureTables(pool);
  const result = await pool.query<BookingRow>(`SELECT * FROM orycms_bookings WHERE id = $1`, [id]);
  const row = result.rows[0];
  if (!row) throw new OryCMSAuthError("UNAUTHORIZED", "Booking not found.", 404);
  return rowToBooking(row);
}

function throwSlotTaken(): never {
  throw Object.assign(new Error("That time is no longer available. Please pick another slot."), {
    code: "SLOT_TAKEN",
    statusCode: 409,
    field: "start",
  });
}

/** `orynticlabs-<uuid>` — collision-resistant and non-guessable, since meet.jit.si rooms need no account/API key, just a unique room name in the URL. */
function generateMeetingUrl(): string {
  return `https://meet.jit.si/orynticlabs-${randomUUID().replace(/-/g, "")}`;
}

async function sendBookingConfirmationEmail(booking: OryCMSBookingRecord): Promise<void> {
  try {
    const when = new Date(booking.startAt).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
    await sendOryCMSEmail({
      to: booking.email,
      subject: "Your call with OrynticLabs is confirmed",
      text: `Hi ${booking.name},\n\nYour call is confirmed for ${when} (India time).\n\nJoin here: ${booking.meetingUrl}\n\n— OrynticLabs`,
      html: `<p>Hi ${booking.name},</p><p>Your call is confirmed for <strong>${when}</strong> (India time).</p><p><a href="${booking.meetingUrl}">Join the call</a></p><p>— OrynticLabs</p>`,
    });
  } catch {
    // Best-effort only — a booking must persist even if email sending fails
    // or no provider is configured.
  }
}

/**
 * Called from the public booking widget — no session, so no actor to
 * attribute the row to. Re-validates the requested slot is still free
 * immediately before inserting (via a single pool client so the check and
 * the insert see a consistent snapshot), since two visitors can race for
 * the same slot between the widget loading available times and submitting.
 */
export async function createOryCMSBooking(
  input: OryCMSBookingInput,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingRecord> {
  await ensureTables(pool);

  const client: PoolClient = await pool.connect();
  let bookingId: string;
  try {
    await client.query("BEGIN");
    const overlap = await client.query(
      `SELECT 1 FROM orycms_bookings
       WHERE status = 'confirmed' AND start_at < $2 AND end_at > $1
       LIMIT 1`,
      [input.start, input.end],
    );
    if ((overlap.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");
      throwSlotTaken();
    }

    const meetingUrl = generateMeetingUrl();
    const insertResult = await client.query<{ id: string }>(
      `INSERT INTO orycms_bookings
        (name, email, phone, company, notes, start_at, end_at, visitor_timezone, meeting_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        input.name,
        input.email,
        input.phone ?? null,
        input.company ?? null,
        input.notes ?? null,
        input.start,
        input.end,
        input.visitorTimezone ?? null,
        meetingUrl,
      ],
    );
    bookingId = insertResult.rows[0].id;
    await client.query("COMMIT");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback failure — original error is what matters
    }
    throw err;
  } finally {
    client.release();
  }

  const record = await getOryCMSBooking(bookingId, pool);
  await sendBookingConfirmationEmail(record);
  return record;
}

export async function updateOryCMSBookingStatus(
  id: string,
  status: OryCMSBookingStatus,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSBookingRecord> {
  await ensureTables(pool);
  const result = await pool.query(
    `UPDATE orycms_bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
    [status, id],
  );
  if (result.rowCount === 0) throw new OryCMSAuthError("UNAUTHORIZED", "Booking not found.", 404);
  return getOryCMSBooking(id, pool);
}

export async function deleteOryCMSBooking(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  await ensureTables(pool);
  await pool.query(`DELETE FROM orycms_bookings WHERE id = $1`, [id]);
}
