/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@echoreader/hooks",
    "@echoreader/ui",
    "@echoreader/utils",
    "@echoreader/types"
  ],
  webpack: (config) => {
    // Basic config fallbacks for node packages
    config.resolve.fallback = { fs: false, path: false };
    return config;
  }
};

module.exports = nextConfig;
