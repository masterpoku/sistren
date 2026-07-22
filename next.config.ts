import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "*.local",
    ...(process.env.DEV_ALLOWED_ORIGINS?.split(",") ?? []),
  ],
};

export default nextConfig;
