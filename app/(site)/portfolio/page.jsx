import { IMAGES } from "@site/data/content";
import { buildPageMetadata } from "@site/lib/seo";
import PortfolioClient from "./PortfolioClient";

export const metadata = buildPageMetadata({
  title: "Portfolio",
  description:
    "Digital products engineered for ambitious businesses — a look at OrynticLabs' service practices, proprietary products, and the industries we serve.",
  path: "/portfolio",
  image: IMAGES.culture,
});

export default function PortfolioPage() {
  return <PortfolioClient />;
}
