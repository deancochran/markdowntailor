import createMDX from "@next/mdx";
import { recmaCodeHike, remarkCodeHike } from "codehike/mdx";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
  // optional (see code docs):
  components: { code: "Code" },
  // if you can't use RSC:
  // syntaxHighlighting: {
  //   theme: "github-dark",
  // },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: "standalone",
  reactStrictMode: true,
  cacheHandler: resolve(__dirname, "./cache-handler.ts"),
  cacheMaxMemorySize: 0, // disable default in-memory caching

  // Ensure proper module resolution for server-side code
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side webpack config adjustments if needed
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    } else {
      // Client-side: disable Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

const withMDX = createMDX({
  remarkPlugins: [[remarkCodeHike, chConfig]],
  recmaPlugins: [[recmaCodeHike, chConfig]],
  jsx: true,
  experimental: {
    mdxRs: false,
  },
});

// Combine MDX and Next.js config
export default withMDX(nextConfig);
