import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/program',
        destination: '/events',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
