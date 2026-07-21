import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/des-moines-web-design",
        destination: "/web-design",
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [75, 100],
  },
};

export default nextConfig;
