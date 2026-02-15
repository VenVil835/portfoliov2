import type { NextConfig } from "next";

/**
 * Next.js Configuration with Security Headers
 * 
 * Implements OWASP recommended security headers for production.
 * These headers protect against:
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - Information disclosure
 */

const securityHeaders = [
  // DNS Prefetch Control - allows browsers to prefetch DNS
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Strict Transport Security - enforce HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer Policy - control referrer information sent
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions Policy - disable unnecessary browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Content Security Policy
  // Note: Adjust 'unsafe-inline' and 'unsafe-eval' based on your needs
  // Next.js requires 'unsafe-inline' for styled-jsx
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "connect-src 'self' https://api.github.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },

  // Enable strict mode for React
  reactStrictMode: true,

  // Powered by header removal for security
  poweredByHeader: false,

  // Disable React DevTools in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
};

export default nextConfig;
