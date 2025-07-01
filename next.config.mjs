import createMDX from "@next/mdx";
import { recmaCodeHike, remarkCodeHike } from "codehike/mdx";

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
  serverExternalPackages: ["pg", "drizzle-orm"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
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
