import type { Metadata } from "next";
import "../../orycms/styles.css";
import { Toaster } from "@/components/ui/sonner";
import { OryCMSSessionProvider } from "@/hooks";

export const metadata: Metadata = {
  title: "OryCMS by Oryntic Labs Private Limited",
  description:
    "OryCMS by Oryntic Labs Private Limited for managing products, orders, customers, inventory, marketing, and analytics.",
  // Admin panel - must never appear in search results.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: "OryCMS by Oryntic Labs Private Limited",
    description: "OryCMS by Oryntic Labs Private Limited for managing your entire storefront.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <OryCMSSessionProvider>{children}</OryCMSSessionProvider>
      <Toaster richColors position="bottom-right" />
    </>
  );
}
