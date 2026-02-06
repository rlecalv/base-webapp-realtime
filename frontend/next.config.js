/** @type {import('next').NextConfig} */
// Backend Node.js (patrimoine) - utilisé pour le rewrite proxy
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;