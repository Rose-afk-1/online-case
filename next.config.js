/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove turbo config
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
    
    // Reduce webpack cache warnings in development
    if (config.mode === 'development') {
      config.infrastructureLogging = {
        level: 'error'
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 