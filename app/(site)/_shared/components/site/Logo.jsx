import Link from "next/link";

export default function Logo({ height = 22, testId = "logo" }) {
  return (
    <Link href="/" data-testid={testId} className="group flex shrink-0 items-center">
      <img
        src="/logo white copy.png"
        alt="Oryntic Labs"
        height={height}
        style={{ height, width: "auto" }}
        className="shrink-0 transition-opacity duration-300 group-hover:opacity-80"
      />
    </Link>
  );
}
