import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: 16 * 1024 * 1024, // 16MB for document uploads
  },
};

export default nextConfig;
