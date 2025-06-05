/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // This is necessary for the markdown editor to work properly
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  // Add transpilePackages to handle @uiw/react-md-editor
  transpilePackages: ["@uiw/react-md-editor"],
};

export default nextConfig;
