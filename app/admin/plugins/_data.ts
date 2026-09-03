import { PlugZap, Sparkles, Truck } from "lucide-react";
import {
  siGoogleanalytics,
  siGooglegemini,
  siMailchimp,
  siRazorpay,
  siWhatsapp,
  siZapier,
} from "simple-icons/icons";
import type { Logo } from "./_components";

export type IntegrationCategory =
  | "Payments"
  | "Communication"
  | "Analytics"
  | "Marketing"
  | "Shipping"
  | "Developer"
  | "AI";

export type IntegrationStatus = "connected" | "not_connected" | "attention";

export type Integration = {
  slug: string;
  name: string;
  vendor: string;
  category: IntegrationCategory;
  description: string;
  longDescription: string;
  logo: Logo;
  defaultStatus: IntegrationStatus;
  scopes: string[];
  popular?: boolean;
  /** True for the one integration with a real, working connect flow to a mock external platform. */
  live?: boolean;
};

export const INTEGRATIONS: Integration[] = [
  {
    slug: "dummy-platform",
    name: "Dummy Platform",
    vendor: "Dummy Platform Inc.",
    category: "Developer",
    description: "Reference connector used to design and test the OryCMS integration flow end-to-end.",
    longDescription:
      "Dummy Platform is a stand-in third-party product used to demonstrate how OryCMS connects to an external service — the authorization screen, scope grants, and the token handshake all run for real between the two apps, just with mock data on both sides.",
    logo: {
      kind: "lucide",
      icon: PlugZap,
      tint: "text-violet-600 bg-violet-100 dark:text-violet-300 dark:bg-violet-500/15",
    },
    defaultStatus: "not_connected",
    scopes: ["Read store catalog", "Read order events", "Send fulfillment webhooks"],
    popular: true,
    live: true,
  },
  {
    slug: "razorpay",
    name: "Razorpay",
    vendor: "Razorpay Software",
    category: "Payments",
    description: "Accept UPI, cards, and net banking, and reconcile settlements automatically.",
    longDescription:
      "Sync OryCMS orders with Razorpay payment links, capture webhooks for payment status, and reconcile settlements against order totals without leaving the admin panel.",
    logo: { kind: "brand", icon: siRazorpay },
    defaultStatus: "connected",
    scopes: ["Create payment links", "Read settlements", "Read refund status"],
    popular: true,
  },
  {
    slug: "whatsapp-business",
    name: "WhatsApp Business",
    vendor: "Meta Platforms",
    category: "Communication",
    description: "Send order confirmations, shipping updates, and support replies over WhatsApp.",
    longDescription:
      "Trigger templated WhatsApp messages on order and shipment events, and route customer replies into the OryCMS support inbox.",
    logo: { kind: "brand", icon: siWhatsapp },
    // Real status now comes from the WhatsApp settings API (see
    // app/admin/plugins/page.tsx's live-status override) — this default
    // only matters before that fetch resolves.
    defaultStatus: "not_connected",
    scopes: ["Send template messages", "Read delivery receipts"],
    popular: true,
  },
  {
    slug: "gemini-ai",
    name: "Gemini AI",
    vendor: "Google LLC",
    category: "AI",
    description: "Connect a Gemini API key so OryCMS AI features have a model to call.",
    longDescription:
      "Configuration only, independent of any other module — no messaging channel is wired to it yet. Set the API key, pick a model, and tune generation defaults; Test Connection makes a real, lightweight call to the Gemini API to confirm the key and model work.",
    logo: { kind: "brand", icon: siGooglegemini },
    // Real status now comes from the Gemini settings API (see
    // app/admin/plugins/page.tsx's live-status override) — this default
    // only matters before that fetch resolves.
    defaultStatus: "not_connected",
    scopes: ["Read stored generation settings", "Call the Gemini API to generate content"],
    popular: true,
  },
  {
    slug: "google-analytics",
    name: "Google Analytics",
    vendor: "Google LLC",
    category: "Analytics",
    description: "Stream storefront traffic and checkout funnel events into GA4.",
    longDescription:
      "Push page views, add-to-cart, and checkout events from the storefront into a GA4 property for funnel and attribution reporting.",
    logo: { kind: "brand", icon: siGoogleanalytics },
    defaultStatus: "attention",
    scopes: ["Send measurement events"],
  },
  {
    slug: "mailchimp",
    name: "Mailchimp",
    vendor: "Intuit Mailchimp",
    category: "Marketing",
    description: "Sync customers into audiences and trigger abandoned-cart journeys.",
    longDescription:
      "Keep Mailchimp audiences in sync with OryCMS customer records and fire abandoned-cart and win-back journeys from storefront events.",
    logo: { kind: "brand", icon: siMailchimp },
    defaultStatus: "not_connected",
    scopes: ["Read customers", "Write audience members"],
  },
  {
    slug: "shiprocket",
    name: "Shiprocket",
    vendor: "Shiprocket Pvt Ltd",
    category: "Shipping",
    description: "Auto-generate shipping labels and sync live tracking back to orders.",
    longDescription:
      "Create shipments and labels for dispatched orders and pull carrier tracking events back into the OryCMS order timeline.",
    // No official mark published in simple-icons — falls back to a generic shipping glyph.
    logo: {
      kind: "lucide",
      icon: Truck,
      tint: "text-sky-600 bg-sky-100 dark:text-sky-300 dark:bg-sky-500/15",
    },
    defaultStatus: "not_connected",
    scopes: ["Create shipments", "Read tracking events"],
  },
  {
    slug: "zapier",
    name: "Zapier",
    vendor: "Zapier Inc.",
    category: "Developer",
    description: "Trigger Zaps from OryCMS events and connect thousands of other apps.",
    longDescription:
      "Expose OryCMS order, customer, and inventory events as Zapier triggers so they can fan out into thousands of other connected apps.",
    logo: { kind: "brand", icon: siZapier },
    defaultStatus: "not_connected",
    scopes: ["Read store events"],
  },
  {
    slug: "oryai-copilot",
    name: "OryAI Copilot",
    vendor: "OrynticLabs",
    category: "Analytics",
    description: "In-house AI assistant that drafts product copy and flags anomalies.",
    longDescription:
      "OrynticLabs' own AI assistant, wired into catalog and order data to draft product descriptions and flag unusual demand or fraud patterns.",
    logo: {
      kind: "lucide",
      icon: Sparkles,
      tint: "text-fuchsia-600 bg-fuchsia-100 dark:text-fuchsia-300 dark:bg-fuchsia-500/15",
    },
    defaultStatus: "connected",
    scopes: ["Read catalog", "Read order anomalies"],
  },
];

export function getIntegration(slug: string): Integration | undefined {
  return INTEGRATIONS.find((integration) => integration.slug === slug);
}

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: "Connected",
  not_connected: "Not connected",
  attention: "Needs attention",
};

export const STATUS_TINT: Record<IntegrationStatus, string> = {
  connected: "text-success bg-success/10",
  not_connected: "text-muted-foreground bg-muted",
  attention: "text-warning bg-warning/10",
};
