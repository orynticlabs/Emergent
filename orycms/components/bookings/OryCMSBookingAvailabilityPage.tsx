"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarCog, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useOryCMSPermission, useOryCMSSession } from "@/hooks";
import { fetchJson } from "@/components/projects/OryCMSProjectsAdminPage";

interface OryCMSBookingDay {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface OryCMSBookingSettings {
  slotDurationMinutes: number;
  bufferMinutes: number;
  bookingWindowDays: number;
  minNoticeHours: number;
  timezone: string;
}

interface OryCMSBookingAvailability {
  days: OryCMSBookingDay[];
  settings: OryCMSBookingSettings;
}

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function OryCMSBookingAvailabilityPage() {
  const { loaded: sessionLoaded } = useOryCMSSession();
  const canRead = useOryCMSPermission("bookings", "read");
  const canUpdate = useOryCMSPermission("bookings", "update");

  const [availability, setAvailability] = useState<OryCMSBookingAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionLoaded || !canRead) return;
    fetchJson<OryCMSBookingAvailability>("/api/orycms/bookings/availability")
      .then(setAvailability)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load availability."))
      .finally(() => setLoading(false));
  }, [sessionLoaded, canRead]);

  const updateDay = (weekday: number, patch: Partial<OryCMSBookingDay>) => {
    setAvailability((prev) =>
      prev ? { ...prev, days: prev.days.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)) } : prev,
    );
  };

  const updateSetting = (patch: Partial<OryCMSBookingSettings>) => {
    setAvailability((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev));
  };

  const save = async () => {
    if (!availability) return;
    setSaving(true);
    try {
      const updated = await fetchJson<OryCMSBookingAvailability>("/api/orycms/bookings/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(availability),
      });
      setAvailability(updated);
      toast.success("Availability saved");
    } catch (err) {
      toast.error("Failed to save availability", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  if (!sessionLoaded || loading) {
    return (
      <div className="mx-auto max-w-[900px] space-y-6 p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarCog className="h-8 w-8 text-muted-foreground" />
            <div className="text-[15px] font-semibold">You don't have access to Availability</div>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Ask an admin for access if you believe this is a mistake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="mx-auto max-w-[900px] p-6 lg:p-8">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error ?? "Availability could not be loaded."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-6 p-6 lg:p-8">
      <PageHeader
        eyebrow="Engagements"
        title="Availability"
        description="The weekly hours and rules the site-wide 'Book a Call' widget uses to compute open time slots (times below are in India Standard Time)."
        actions={
          canUpdate
            ? [{ label: saving ? "Saving…" : "Save", icon: Save, onClick: () => void save() }]
            : undefined
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <Card className="rounded-2xl border-border bg-surface/60 shadow-none">
        <CardContent className="divide-y divide-border p-0">
          {availability.days
            .slice()
            .sort((a, b) => a.weekday - b.weekday)
            .map((day) => (
              <div key={day.weekday} className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex w-36 shrink-0 items-center gap-3">
                  <Switch
                    checked={day.enabled}
                    disabled={!canUpdate}
                    onCheckedChange={(checked) => updateDay(day.weekday, { enabled: checked })}
                  />
                  <span className="text-[13px] font-medium">{WEEKDAY_LABELS[day.weekday]}</span>
                </div>
                {day.enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={day.startTime}
                      disabled={!canUpdate}
                      onChange={(e) => updateDay(day.weekday, { startTime: e.target.value })}
                      className="h-9 w-32 text-[12.5px]"
                    />
                    <span className="text-[12.5px] text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={day.endTime}
                      disabled={!canUpdate}
                      onChange={(e) => updateDay(day.weekday, { endTime: e.target.value })}
                      className="h-9 w-32 text-[12.5px]"
                    />
                  </div>
                ) : (
                  <span className="text-[12.5px] text-muted-foreground">Unavailable</span>
                )}
              </div>
            ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-surface/60 shadow-none">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <Label className="text-[12px] text-muted-foreground">Slot duration (minutes)</Label>
            <Input
              type="number"
              min={5}
              value={availability.settings.slotDurationMinutes}
              disabled={!canUpdate}
              onChange={(e) => updateSetting({ slotDurationMinutes: Number(e.target.value) })}
              className="mt-1.5 h-9 text-[12.5px]"
            />
          </div>
          <div>
            <Label className="text-[12px] text-muted-foreground">Buffer between calls (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={availability.settings.bufferMinutes}
              disabled={!canUpdate}
              onChange={(e) => updateSetting({ bufferMinutes: Number(e.target.value) })}
              className="mt-1.5 h-9 text-[12.5px]"
            />
          </div>
          <div>
            <Label className="text-[12px] text-muted-foreground">Bookable window (days ahead)</Label>
            <Input
              type="number"
              min={1}
              value={availability.settings.bookingWindowDays}
              disabled={!canUpdate}
              onChange={(e) => updateSetting({ bookingWindowDays: Number(e.target.value) })}
              className="mt-1.5 h-9 text-[12.5px]"
            />
          </div>
          <div>
            <Label className="text-[12px] text-muted-foreground">Minimum notice (hours)</Label>
            <Input
              type="number"
              min={0}
              value={availability.settings.minNoticeHours}
              disabled={!canUpdate}
              onChange={(e) => updateSetting({ minNoticeHours: Number(e.target.value) })}
              className="mt-1.5 h-9 text-[12.5px]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-[12px] text-muted-foreground">Business timezone</Label>
            <Input value={availability.settings.timezone} disabled className="mt-1.5 h-9 text-[12.5px]" />
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              Fixed to Asia/Kolkata for now — every time above is interpreted in India Standard Time.
            </p>
          </div>
        </CardContent>
      </Card>

      {canUpdate && (
        <Button onClick={() => void save()} disabled={saving} className="h-9 gap-1.5 text-[13px]">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save availability"}
        </Button>
      )}
    </div>
  );
}
