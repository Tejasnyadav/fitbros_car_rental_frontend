import type { NextConfig } from "next";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const apiUrl = new URL(configuredApiUrl);
const apiPath = apiUrl.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
const apiDestination = `${apiUrl.origin}${apiPath}/api/:path*`;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: apiDestination
      }
    ];
  }
};

export default nextConfig;
