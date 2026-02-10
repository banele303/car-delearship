// import type { NextConfig } from "next";

const nextConfig = {
  images: {
    unoptimized: true, // Bypass Next.js image optimizer to avoid 402 responses
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Experimental features
  experimental: {
    // serverMaxBodySize is not a valid Next.js option
  },
  // Add environment variables from .env files
  env: {
    // AWS Configuration
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    // Google Maps API Key
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    // Cognito Configuration
    NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID,
    // Database Configuration - explicitly pass DATABASE_URL to server environment
    DATABASE_URL: process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL,
  },
  // External packages configuration
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Expose uploaded files from /uploads through a rewrite (NOT for production scale / security hardening)
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/static/uploads/:path*', // placeholder; we can implement a secure file server route later
      },
    ];
  },
};

export default nextConfig;
