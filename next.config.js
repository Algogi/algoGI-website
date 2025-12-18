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

const nextConfig = {
  reactStrictMode: true,
  // Enable source maps for coverage collection
  productionBrowserSourceMaps: true,
  // Configure Turbopack (Next.js 16+ default)
  turbopack: {},
  // Enable webpack source maps in development (for non-Turbopack builds)
  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      // Enable source maps for client-side code in production builds
      config.devtool = 'source-map';
    }
    return config;
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
};

module.exports = nextConfig;

