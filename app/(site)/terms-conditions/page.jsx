import TermsConditionsClient from "./TermsConditionsClient";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description: "The commercial, operational, and intellectual property terms governing engagement with Oryntic Labs.",
  path: "/terms-conditions",
});

export default function TermsConditionsPage() {
  return <TermsConditionsClient />;
}
