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
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Desktop view of markdowntailor",
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "540x960",
        type: "image/png",
        label: "Mobile view of markdowntailor",
      },
    ],
  };
}
