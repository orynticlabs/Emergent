import Legal from "@site/pages/Legal";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "How OrynticLabs Private Limited collects, uses, and protects your information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <Legal kind="privacy-policy" />;
}
