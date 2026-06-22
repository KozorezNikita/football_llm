import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.fotmob.com" },
    ],
  },
  experimental: {
    // View Transitions. У Next 16 прапор лишається в experimental для
    // увімкнення React-компонента <ViewTransition>.
    viewTransition: true,
  },
};

export default nextConfig;
