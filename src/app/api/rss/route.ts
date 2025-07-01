import { getPosts } from "@/lib/blog";
import { Feed } from "feed";

export async function GET(request: Request) {
  const baseUrl = "https://markdowntailor.com";

  // Create feed with site metadata
  const feed = new Feed({
    title: "markdowntailor Blog",
    description:
      "Articles on resume building, job hunting, and ATS optimization",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    image: `${baseUrl}/logo.png`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `Copyright © ${new Date().getFullYear()} markdowntailor`,
    updated: new Date(),
    generator: "markdowntailor",
    feedLinks: {
      json: `${baseUrl}/api/rss/json`,
      atom: `${baseUrl}/api/rss/atom`,
    },
    author: {
      name: "markdowntailor Team",
      email: "info@markdowntailor.com",
      link: baseUrl,
    },
  });

  // Get blog posts from the blog utility
  const posts = await getPosts();

  // Add each post to the feed
  posts.forEach((post) => {
    const postDate = new Date(post.publishedOn);

    feed.addItem({
      title: post.title,
      id: `${baseUrl}/blog/${post.slug}`,
      link: `${baseUrl}/blog/${post.slug}`,
      description: post.description  || "",
      content: post.content,
      author: [
        {
          name: "markdowntailor Team",
          email: "info@markdowntailor.com",
          link: baseUrl,
        },
      ],
      date: postDate,
    });
  });

  // Add categories
  feed.addCategory("Resume Building");
  feed.addCategory("Career Development");
  feed.addCategory("Job Search");

  // Return the feed in the requested format
  const acceptHeader = request.headers.get("Accept");

  if (acceptHeader?.includes("application/atom+xml")) {
    return new Response(feed.atom1(), {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
      },
    });
  } else if (acceptHeader?.includes("application/json")) {
    return new Response(feed.json1(), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } else {
    return new Response(feed.rss2(), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  }
}
