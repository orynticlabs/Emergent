import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Public surfaces ─────────────────────────────────────────────────────────

/** Admin page routes that never require a session. */
const PUBLIC_PAGES = new Set([
  "/admin/login",
  "/admin/setup",
  "/admin/accept-invite",
  "/admin/activate",
  "/admin/reset-password",
  "/admin/forgot-password",
]);

/** All auth API routes are public. */
const PUBLIC_API_PREFIX = "/api/orycms/auth/";

/**
 * Razorpay calls this directly with no OryCMS session — it can only ever
 * send a POST, and identity/trust comes from the HMAC signature verified
 * inside the route itself (see app/api/orycms/webhooks/razorpay/route.ts),
 * not from anything middleware can check.
 */
const RAZORPAY_WEBHOOK_PATH = "/api/orycms/webhooks/razorpay";

/**
 * WhatsApp (Meta) calls this directly with no OryCMS session — GET is
 * Meta's subscription-verification challenge, POST is incoming events.
 * Identity/trust comes from the `hub.verify_token` match (GET) or the
 * `X-Hub-Signature-256` HMAC (POST) verified inside the route itself (see
 * app/api/orycms/whatsapp/webhook/route.ts), not from anything middleware
 * can check — same reasoning as RAZORPAY_WEBHOOK_PATH above, just with
 * both methods public since WhatsApp uses GET for verification too.
 */
const WHATSAPP_WEBHOOK_PATH = "/api/orycms/whatsapp/webhook";

/**
 * Public content read API routes — GET only.
 * Pattern: /api/orycms/collections/<slug>/content (list)
 *          /api/orycms/collections/<slug>/content/<id> (single, no further segments)
 *
 * POST/PATCH/DELETE on these same paths still require a session —
 * the check is done per-request based on method.
 */
const PUBLIC_CONTENT_GET_RE = /^\/api\/orycms\/collections\/[^/]+\/content(?:\/[^/]+)?$/;

/** Public announcement-bar read — GET only, no session required. */
const PUBLIC_ANNOUNCEMENTS_GET_RE = /^\/api\/orycms\/announcements\/public$/;

/** Public "trusted by" companies read — GET only, no session required. */
const PUBLIC_COMPANIES_GET_RE = /^\/api\/orycms\/companies\/public$/;

/** Public product-box image URLs read — GET only, no session required. */
const PUBLIC_PRODUCT_IMAGES_GET_RE = /^\/api\/orycms\/settings\/product-images\/public$/;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the `from` value is safe to use as a redirect target:
 * - Must be a relative path (starts with /)
 * - Must not start with // (protocol-relative → external redirect)
 * - Must not be /admin/login or /admin/setup (would cause redirect loops)
 */
function isSafeFrom(from: string | null): from is string {
  if (!from) return false;
  if (!from.startsWith("/") || from.startsWith("//")) return false;
  if (from === "/admin/login" || from === "/admin/setup") return false;
  return true;
}

// ── Middleware ───────────────────────────────────────────────────────────────
//
// Only guards OryCMS: the marketing site (everything outside /admin and
// /api/orycms) is untouched by this middleware — see `config.matcher` below.

export function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl;
  const requestMethod = request.method ?? method ?? "GET";

  // Auth API — always public
  if (pathname.startsWith(PUBLIC_API_PREFIX)) return NextResponse.next();

  // Razorpay webhook — public; the route itself verifies the HMAC signature.
  if (requestMethod === "POST" && pathname === RAZORPAY_WEBHOOK_PATH) return NextResponse.next();

  // WhatsApp webhook — public for both GET (verification challenge) and
  // POST (events); the route itself verifies the token/signature.
  if (pathname === WHATSAPP_WEBHOOK_PATH && (requestMethod === "GET" || requestMethod === "POST")) {
    return NextResponse.next();
  }

  // Public admin page routes
  if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();

  // Public content GET endpoints (read-only, no session required)
  if (requestMethod === "GET" && PUBLIC_CONTENT_GET_RE.test(pathname)) {
    return NextResponse.next();
  }

  // Public announcement-bar GET endpoint (read-only, no session required)
  if (requestMethod === "GET" && PUBLIC_ANNOUNCEMENTS_GET_RE.test(pathname)) {
    return NextResponse.next();
  }

  // Public companies ("trusted by") GET endpoint (read-only, no session required)
  if (requestMethod === "GET" && PUBLIC_COMPANIES_GET_RE.test(pathname)) {
    return NextResponse.next();
  }

  // Public product-box image URLs GET endpoint (read-only, no session required)
  if (requestMethod === "GET" && PUBLIC_PRODUCT_IMAGES_GET_RE.test(pathname)) {
    return NextResponse.next();
  }

  // Everything else requires a session
  const sessionCookie = request.cookies.get("orycms_session");
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    // Only carry `from` for safe relative paths — prevents open-redirect
    if (isSafeFrom(pathname)) {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run this middleware for OryCMS's own surface — the marketing site
  // is never touched by it.
  matcher: ["/admin/:path*", "/api/orycms/:path*"],
};
