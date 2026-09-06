// Root layout for the whole app (marketing site + /admin). Deliberately
// carries no CSS of its own — the marketing site (app/(site)/layout.tsx,
// Tailwind v4 via site.css) and OryCMS admin (app/admin/layout.tsx,
// orycms/styles.css) each own and load their own stylesheet in their
// nested layout, so the two design systems never both load on one page.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
