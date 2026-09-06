import { IMAGES } from "@site/data/content";
import { buildPageMetadata } from "@site/lib/seo";
import MobileDevelopmentClient from "./MobileDevelopmentClient";

export const metadata = buildPageMetadata({
  title: "Mobile Development",
  description:
    "Native and cross-platform mobile applications for iOS and Android — consumer apps, enterprise mobility, and hybrid products. React Native, Expo, Swift, Kotlin, and Flutter, chosen per project.",
  path: "/services/mobile-development",
  image: IMAGES.hero,
});

export default function MobileDevelopmentPage() {
  return <MobileDevelopmentClient />;
}
