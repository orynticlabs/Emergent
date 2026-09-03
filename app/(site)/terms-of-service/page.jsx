import Legal from "@site/pages/Legal";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Service-level terms for OrynticLabs platforms and products, including OryAI, OryCMS, and PerformX.",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return <Legal kind="terms-of-service" />;
}
