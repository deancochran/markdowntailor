import { getPosts } from "@/lib/blog";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the site
  const baseUrl = "https://markdowntailor.com";

  // Static routes with metadata
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Get all blog posts
  const posts = await getPosts();

  // Create sitemap entries for blog posts
  const blogPostRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    // Convert the published date to a Date object
    const publishDate = new Date(post.publishedOn);

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: publishDate,
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  // Combine static routes and dynamic blog post routes
  return [...staticRoutes, ...blogPostRoutes];
}
