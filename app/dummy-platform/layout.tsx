import type { Metadata } from "next";
import "./dummy.css";

export const metadata: Metadata = {
  title: "Dummy Platform",
  description: "A mock third-party product used to design the OryCMS integration connect flow.",
  robots: { index: false, follow: false },
};

export default function DummyPlatformLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
