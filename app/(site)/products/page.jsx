import { buildPageMetadata } from "@site/lib/seo";
import ProductsClient from "./ProductsClient";

export const metadata = buildPageMetadata({
  title: "Products",
  description:
    "Our proprietary product suite - used internally, offered to clients as part of engagements, and in some cases available as standalone products.",
  path: "/products",
});

export default function ProductsPage() {
  return <ProductsClient />;
}
