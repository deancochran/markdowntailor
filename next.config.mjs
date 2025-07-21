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
  basePath: process.env.NODE_ENV == "production" ? "/markdowntailor": "",
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: "export",
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  // Enable React strict modes
  reactStrictMode: true,
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
