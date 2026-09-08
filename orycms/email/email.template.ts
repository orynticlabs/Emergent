/**
 * Single global HTML shell every OryCMS system email renders through -
 * white / black / orange, matching the OryCMS admin brand (see the login
 * page's logo at public/orycms/img/favicon.png). Add a new transactional
 * email by writing a plain-text body and one `renderOryCMSEmail()` call -
 * never a one-off template - so every email stays visually consistent.
 *
 * Light theme deliberately, not the dark admin UI: transactional email is
 * read in inboxes with images-off-by-default and dark-mode auto-inversion
 * quirks, and a plain white card with black text is the most reliable
 * rendering across Gmail/Outlook/Apple Mail - the same reasoning most
 * professional transactional templates (Stripe, GitHub, etc.) follow.
 */

const BRAND_ORANGE = "#FF5500";
const BLACK = "#0A0A0A";
const WHITE = "#FFFFFF";
const PAGE_BG = "#F4F4F5";
const BORDER = "#E4E4E7";
const TEXT = "#18181B";
const MUTED = "#71717A";
const SECURITY_BG = "#FFF4EE";
const SECURITY_BORDER = "#FFD9C2";

/**
 * Absolute URL to the OryCMS logo - must be absolute (not a relative path)
 * for email clients to load it at all. Built from ORYCMS_APP_URL the same
 * way orycms/auth/token-links.ts builds absolute links; if that env var
 * isn't set (e.g. local dev pointed at localhost), we fall back to a text
 * wordmark instead of risking a broken-image icon in the inbox.
 */
function getOryCMSLogoUrl(): string | null {
  const origin = process.env.ORYCMS_APP_URL;
  if (!origin || origin.includes("localhost")) return null;
  return `${origin.replace(/\/$/, "")}/orycms/img/favicon.png`;
}

export interface OryCMSEmailTemplateOptions {
  /** Short heading shown above the body copy, e.g. "Reset your password". */
  heading: string;
  /** Body paragraph(s), plain text - one <p> per array entry. */
  paragraphs: string[];
  /** Primary call-to-action button. */
  cta: { label: string; url: string };
  /** Small print under the button, e.g. an expiry notice. */
  footnote?: string;
  /**
   * Security reassurance line shown in a highlighted box below the CTA -
   * defaults to a generic "didn't request this" notice. Pass a specific
   * one per email type (e.g. password reset vs. invite) when the generic
   * default isn't precise enough.
   */
  securityNotice?: string;
}

export function renderOryCMSEmail({
  heading,
  paragraphs,
  cta,
  footnote,
  securityNotice = "If you didn't request this, you can safely ignore this email - no changes will be made to your account. Never share this link with anyone; Oryntic Labs staff will never ask you for it.",
}: OryCMSEmailTemplateOptions): string {
  const paragraphsHtml = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${TEXT};">${escapeHtml(p)}</p>`,
    )
    .join("");

  const logoUrl = getOryCMSLogoUrl();
  const logoHtml = logoUrl
    ? `<img src="${escapeAttr(logoUrl)}" alt="OryCMS" width="32" height="32" style="display:inline-block;vertical-align:middle;border-radius:6px;" />
       <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:800;font-size:18px;letter-spacing:-0.02em;color:${WHITE};">Ory<span style="color:${BRAND_ORANGE};">CMS</span></span>`
    : `<span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.02em;color:${WHITE};">Ory<span style="color:${BRAND_ORANGE};">CMS</span></span>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;">
            <tr>
              <td style="background:${BLACK};border-radius:12px 12px 0 0;padding:22px 32px;" align="center">
                ${logoHtml}
              </td>
            </tr>
            <tr>
              <td style="height:3px;line-height:3px;font-size:0;background:${BRAND_ORANGE};">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:${WHITE};border:1px solid ${BORDER};border-top:none;border-radius:0 0 12px 12px;padding:32px 32px 28px;">
                <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${TEXT};font-weight:700;">${escapeHtml(heading)}</h1>
                ${paragraphsHtml}
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
                  <tr>
                    <td style="border-radius:8px;background:${BRAND_ORANGE};">
                      <a href="${escapeAttr(cta.url)}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:${WHITE};text-decoration:none;border-radius:8px;">
                        ${escapeHtml(cta.label)}
                      </a>
                    </td>
                  </tr>
                </table>
                ${footnote ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(footnote)}</p>` : ""}
                <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:${MUTED};word-break:break-all;">
                  Or paste this link into your browser:<br />
                  <a href="${escapeAttr(cta.url)}" style="color:${BRAND_ORANGE};">${escapeHtml(cta.url)}</a>
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background:${SECURITY_BG};border:1px solid ${SECURITY_BORDER};border-radius:8px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <p style="margin:0;font-size:12.5px;line-height:1.6;color:#7A3A1D;">
                        <strong>🔒 Security:</strong> ${escapeHtml(securityNotice)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 0;" align="center">
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  Oryntic Labs Private Limited · This is an automated message from OryCMS.<br />
                  Need help? <a href="mailto:support@orynticlabs.com" style="color:${MUTED};">support@orynticlabs.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
