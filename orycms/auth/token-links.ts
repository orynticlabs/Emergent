import type { NextRequest } from "next/server";
import { sendOryCMSEmail } from "@/email";
import { renderOryCMSEmail } from "@/email/email.template";
import type { OryCMSTokenType } from "@/tokens";

// Token types that are delivered as a clickable link (email or dev-mode
// response). "mfa_setup" and "mfa_login" tokens never leave the server as a
// link - they're consumed in-app via /api/orycms/auth/mfa/verify and
// /api/orycms/auth/mfa/login-verify respectively - so both are excluded here.
type OryCMSLinkTokenType = Exclude<OryCMSTokenType, "mfa_setup" | "mfa_login">;

// Frontend page paths that consume each token type - must match the
// PUBLIC_PAGES allowlist in middleware.ts (all live under /admin so the
// middleware's session guard, which only runs on /admin/:path*, can see them).
const TOKEN_PATHS: Record<OryCMSLinkTokenType, string> = {
  invite: "/admin/accept-invite",
  activation: "/admin/activate",
  reset: "/admin/reset-password",
};

/** Base URL for building token links: ORYCMS_APP_URL env wins, else request origin. */
export function oryAppOrigin(request: NextRequest): string {
  return process.env.ORYCMS_APP_URL?.replace(/\/$/, "") ?? request.nextUrl.origin;
}

/** Build the absolute link a user clicks to complete a token flow. */
export function buildOryCMSTokenLink(
  request: NextRequest,
  type: OryCMSLinkTokenType,
  rawToken: string,
): string {
  return `${oryAppOrigin(request)}${TOKEN_PATHS[type]}?token=${rawToken}`;
}

const SUBJECTS: Record<OryCMSLinkTokenType, string> = {
  invite: "You've been invited to OryCMS",
  activation: "Activate your OryCMS account",
  reset: "Reset your OryCMS password",
};

const BODY: Record<OryCMSLinkTokenType, (link: string) => string> = {
  invite: (link) => `You've been invited to OryCMS. Set your password to get started:\n\n${link}`,
  activation: (link) => `Activate your OryCMS account by opening this link:\n\n${link}`,
  reset: (link) => `Reset your OryCMS password using this link (expires in 1 hour):\n\n${link}`,
};

const EMAIL_CONTENT: Record<
  OryCMSLinkTokenType,
  {
    heading: string;
    paragraphs: string[];
    ctaLabel: string;
    footnote?: string;
    securityNotice: string;
  }
> = {
  invite: {
    heading: "You've been invited to OryCMS",
    paragraphs: [
      "You've been invited to join a workspace on OryCMS, Oryntic Labs' content and operations platform. Set your password to get started.",
    ],
    ctaLabel: "Accept invite",
    footnote: "This invite link expires in 7 days.",
    securityNotice:
      "This invite was sent to you directly and can only be used once. If you weren't expecting an invite to OryCMS, you can ignore this email - no account will be created.",
  },
  activation: {
    heading: "Activate your account",
    paragraphs: ["Open the button below to activate your OryCMS account."],
    ctaLabel: "Activate account",
    footnote: "This activation link expires in 3 days.",
    securityNotice:
      "This link is single-use and tied to your account only. If you didn't create an OryCMS account, you can safely ignore this email.",
  },
  reset: {
    heading: "Reset your password",
    paragraphs: [
      "We received a request to reset your OryCMS password. If this wasn't you, you can safely ignore this email - your password will not be changed.",
    ],
    ctaLabel: "Reset password",
    footnote: "This link expires in 1 hour.",
    securityNotice:
      "If you didn't request a password reset, your account may still be secure - but consider signing in and reviewing your recent activity. This link expires in 1 hour and can only be used once.",
  },
};

export interface OryCMSTokenDispatchResult {
  /** True when the email was sent by a configured provider. */
  emailed: boolean;
  /**
   * The raw link - returned ONLY in dev/no-provider mode so setup works without
   * email. Null when a provider sent the email (never leak the link then).
   */
  link: string | null;
}

/**
 * Deliver a token link: email it when a provider is configured, otherwise
 * return the link for the caller to surface in the API response (dev mode).
 * Email send failures degrade gracefully to returning the link.
 */
export async function dispatchOryCMSTokenLink(
  request: NextRequest,
  type: OryCMSLinkTokenType,
  email: string,
  rawToken: string,
): Promise<OryCMSTokenDispatchResult> {
  const link = buildOryCMSTokenLink(request, type, rawToken);
  try {
    const content = EMAIL_CONTENT[type];
    const result = await sendOryCMSEmail({
      to: email,
      subject: SUBJECTS[type],
      text: BODY[type](link),
      html: renderOryCMSEmail({
        heading: content.heading,
        paragraphs: content.paragraphs,
        cta: { label: content.ctaLabel, url: link },
        footnote: content.footnote,
        securityNotice: content.securityNotice,
      }),
    });
    if (result.sent) return { emailed: true, link: null };
  } catch {
    // Provider misconfigured / down - fall back to returning the link.
  }
  return { emailed: false, link };
}
