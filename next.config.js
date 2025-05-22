/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove turbo config
  },
  // Font optimization is now part of the main config
  fontLoaders: {
    optimizeFonts: false
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Add webpack configuration for PDFKit
  webpack: (config, { isServer }) => {
    // Fix for PDFKit browser usage
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 