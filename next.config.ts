import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      { source: "/contact", destination: "/contact-us", permanent: true },
    ];
  },
};

export default nextConfig;
