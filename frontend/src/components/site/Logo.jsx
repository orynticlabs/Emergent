import { Link } from "react-router-dom";

export default function Logo({ textClass = "text-xl", markSize = 34, testId = "logo" }) {
  const gid = `ory-gradient-${testId}`;
  return (
    <Link to="/" data-testid={testId} className="group flex items-center gap-2.5">
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-500 ease-out group-hover:rotate-[30deg]"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF5500" />
            <stop offset="1" stopColor="#0066FF" />
          </linearGradient>
        </defs>
        <path
          d="M20 2.5 L35 11.25 V28.75 L20 37.5 L5 28.75 V11.25 Z"
          stroke={`url(#${gid})`}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="20" r="7" stroke={`url(#${gid})`} strokeWidth="2.4" />
        <circle cx="20" cy="20" r="2.4" fill="#FF5500" />
      </svg>
      <span className={`font-display font-extrabold tracking-tight text-white ${textClass}`}>
        ORYNTIC<span className="text-brand-orange">LABS</span>
      </span>
    </Link>
  );
}
