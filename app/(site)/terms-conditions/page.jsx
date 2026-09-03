import Legal from "@site/pages/Legal";
import { buildPageMetadata } from "@site/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description: "The terms governing use of the OrynticLabs website and engagement with our services.",
  path: "/terms-conditions",
});

export default function TermsConditionsPage() {
  return <Legal kind="terms-conditions" />;
}
