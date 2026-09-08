import { IMAGES } from "@site/data/content";
import { buildPageMetadata } from "@site/lib/seo";
import HomeClient from "./HomeClient";

export const metadata = buildPageMetadata({
  title: "Oryntic Labs - Engineering Intelligent Software",
  description:
    "A full-spectrum technology company engineering intelligent software: web, mobile, AI/ML, data, cloud, and design.",
  path: "/",
  image: IMAGES.hero,
});

export default function HomePage() {
  return <HomeClient />;
}
