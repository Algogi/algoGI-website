/** @type {import('next').NextConfig} */
// Extract WordPress domain from environment variable if available
const getWordPressDomain = () => {
  const wpUrl = process.env.WORDPRESS_API_URL;
  if (wpUrl) {
    try {
      const url = new URL(wpUrl);
      return url.hostname;
    } catch {
      // If URL parsing fails, return null
      return null;
    }
  }
  return null;
};

const wordpressDomain = getWordPressDomain();

const oneYear = 60 * 60 * 24 * 365;

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  generateEtags: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      // WordPress image domains - dynamically added from WORDPRESS_API_URL
      ...(wordpressDomain
        ? [
            {
              protocol: 'https',
              hostname: wordpressDomain,
              pathname: '/**',
            },
            {
              protocol: 'http',
              hostname: wordpressDomain,
              pathname: '/**',
            },
          ]
        : [
            // Fallback: add common WordPress domain if env var not set
            {
              protocol: 'https',
              hostname: 'algogi.com',
              pathname: '/**',
            },
            {
              protocol: 'http',
              hostname: 'algogi.com',
              pathname: '/**',
            },
          ]),
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico)',
        headers: [
          { key: 'Cache-Control', value: `public, max-age=${oneYear}, immutable` },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: `public, max-age=${oneYear}, immutable` },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

