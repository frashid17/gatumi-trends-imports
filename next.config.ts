import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin may paste any product image URL; avoid hostname allowlists during setup.
    unoptimized: true,
  },
};

export default nextConfig;
