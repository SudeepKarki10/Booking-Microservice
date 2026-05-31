import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups" // Allows Google Sign-In popup to communicate with the application
          }
        ]
      }
    ];
  }
};

export default nextConfig;
