import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "markdowntailor - ATS-Optimized Resume Builder",
    short_name: "markdowntailor",
    description:
      "Create powerful, ATS-friendly resumes with our markdown-based resume builder",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/logo.png", // Using existing logo as icon
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
