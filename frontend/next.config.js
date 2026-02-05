/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [],
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
    NEXT_PUBLIC_SOCKET_URL: SOCKET_URL,
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignorer les erreurs ESLint pendant le build pour le dev
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;