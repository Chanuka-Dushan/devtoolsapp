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
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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

  // Rewrites to proxy Caption Tool Studio and API
  async rewrites() {
    const captionBackend =
      process.env.CAPTION_BACKEND_URL ||
      process.env.NEXT_PUBLIC_CAPTION_BACKEND_URL ||
      "http://127.0.0.1:8000";

    return [
      {
        source: "/caption-studio/:path*",
        destination: "http://localhost:5173/:path*",
      },
      {
        source: "/caption-api/:path*",
        destination: `${captionBackend.replace(/\/+$/, "")}/:path*`,
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
