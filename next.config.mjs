/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // This is necessary for the markdown editor to work properly
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Add transpilePackages to handle @uiw/react-md-editor
  transpilePackages: ["@uiw/react-md-editor"],
};

export default nextConfig;
