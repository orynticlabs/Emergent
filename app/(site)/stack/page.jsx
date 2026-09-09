import { buildPageMetadata } from "@site/lib/seo";
import StackClient from "./StackClient";

export const metadata = buildPageMetadata({
  title: "Technology Stack",
  description:
    "We are technology-agnostic by principle. We choose the right tool for the problem - not the one that is trending or the one that is easiest to sell.",
  path: "/stack",
});

export default function TechStack() {
  return <StackClient />;
}
