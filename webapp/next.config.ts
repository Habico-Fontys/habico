import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AGENTS.md lives at the repo root (shared with the embedded project); stop `next dev` from recreating one here.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [
      {
        pathname: "/habico-logo-transparent-v2.png",
        search: "",
      },
      {
        pathname: "/habico-icon-transparent.png",
        search: "",
      },
    ],
  },
};

export default nextConfig;
