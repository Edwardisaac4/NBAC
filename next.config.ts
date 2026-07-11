import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'qygcfwxjcejmloshznrx.supabase.co',
      },
    ],
  },
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
