const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Production optimizations for Next.js 15
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Cache authenticated API responses (private = browser-only, not CDN)
      {
        source: '/api/barns/:barnId/horses',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=120, stale-while-revalidate=300',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      {
        source: '/api/barns/:barnId/events',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=30, stale-while-revalidate=180',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      {
        source: '/api/barns/:barnId/clients',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=300, stale-while-revalidate=600',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      {
        source: '/api/barns/:barnId/tasks',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=30, stale-while-revalidate=120',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      {
        source: '/api/barns/:barnId/invoices',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=60, stale-while-revalidate=180',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      {
        source: '/api/barns/:barnId/alerts',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=30, stale-while-revalidate=120',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      {
        source: '/api/barns/:barnId/activity',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=60, stale-while-revalidate=180',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie',
          },
        ],
      },
      // Never cache CSRF tokens or webhooks
      {
        source: '/api/csrf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/api/webhooks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Upload source maps for better stack traces
  org: 'stabletrack',
  project: 'javascript-nextjs',

  // Suppress source map upload logs during build
  silent: !process.env.CI,

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,

  // Upload source maps only when auth token is available
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
