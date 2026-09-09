import PrivacyPolicyClient from "./PrivacyPolicyClient";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Privacy & Data Protection Policy",
  description: "How Oryntic Labs Private Limited collects, uses, and protects your personal data, source code, and commercial specifications.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
