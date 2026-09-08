import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "img-c.udemycdn.com" },
      { protocol: "https", hostname: "udemy-images.udemy.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // Compiler options
  compiler: {
    // Remove console.log in production (keep errors and warnings)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
