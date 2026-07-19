/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          'https://business-logic-engine-node-production.up.railway.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
