import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/", "/resumes/", "/login/"],
    },
    sitemap: "https://markdowntailor.com/sitemap.xml",
  };
}
