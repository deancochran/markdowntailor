import { getPosts } from "@/lib/blog";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes with metadata
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `https://markdowntailor.com`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `https://markdowntailor.com/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `https://markdowntailor.com/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `https://markdowntailor.com/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `https://markdowntailor.com/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `https://markdowntailor.com/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `https://markdowntailor.com/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `https://markdowntailor.com/templates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Get all blog posts
  const posts = await getPosts();

  // Create sitemap entries for blog posts
  const blogPostRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    // Convert the published date to a Date object
    const publishDate = new Date(post.publishedOn);

    return {
      url: `https://markdowntailor.com/blog/${post.slug}`,
      lastModified: publishDate,
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  // Combine static routes and dynamic blog post routes
  return [...staticRoutes, ...blogPostRoutes];
}
