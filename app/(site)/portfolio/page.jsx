import { IMAGES } from "@site/data/content";
import { buildPageMetadata } from "@site/lib/seo";
import { listActiveOryCMSCaseStudies } from "@/case-studies";
import PortfolioClient from "./PortfolioClient";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Portfolio",
  description:
    "Digital products engineered for ambitious businesses - a look at Oryntic Labs' service practices, proprietary products, and the industries we serve.",
  path: "/portfolio",
  image: IMAGES.culture,
});

function toProject(record) {
  return {
    ...record,
    image: record.imageUrl,
    desc: record.description,
  };
}

export default async function PortfolioPage() {
  let initialCaseStudies = [];
  try {
    const records = await listActiveOryCMSCaseStudies();
    initialCaseStudies = records.map(toProject);
  } catch {
    initialCaseStudies = [];
  }

  return <PortfolioClient initialCaseStudies={initialCaseStudies} />;
}
