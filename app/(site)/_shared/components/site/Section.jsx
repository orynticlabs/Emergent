"use client";

const BACKGROUNDS = {
  ink: "bg-brand-ink text-white",
  paper: "bg-brand-paper text-brand-coal",
  mesh: "bg-mesh-brand text-white",
  grid: "bg-grid-dark bg-brand-ink text-white",
  transparent: "",
};

const SIZES = {
  default: "py-24 md:py-32",
  tight: "py-16 md:py-20",
  hero: "pb-20 pt-40 md:pt-48",
};

/**
 * Standard vertical-rhythm + container wrapper for marketing-site sections, so new
 * sections stop hand-rolling `mx-auto max-w-7xl px-6 md:px-10` + one-off padding.
 * Existing sections are migrated incrementally, not all at once.
 */
export default function Section({
  as: Tag = "section",
  background = "ink",
  size = "default",
  container = "max-w-7xl",
  className = "",
  containerClassName = "",
  testId,
  children,
}) {
  return (
    <Tag data-testid={testId} className={`relative overflow-hidden ${BACKGROUNDS[background]} ${SIZES[size]} ${className}`}>
      <div className={`relative mx-auto ${container} px-6 md:px-10 ${containerClassName}`}>{children}</div>
    </Tag>
  );
}
