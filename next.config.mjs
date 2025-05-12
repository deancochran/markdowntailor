/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // This is necessary for the markdown editor to work properly
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  // Add transpilePackages to handle @uiw/react-md-editor
  transpilePackages: ['@uiw/react-md-editor'],
};

export default nextConfig;