import { getPosts } from "@/lib/blog";
import { generateOrganizationSchema } from "@/lib/utils/seo";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Blog - Resume Tips & Career Advice",
  description:
    "Expert advice on resume building, job hunting strategies, and ATS optimization techniques.",
  openGraph: {
    title: "Blog - Resume Tips & Career Advice | markdowntailor",
    description:
      "Expert advice on resume building, job hunting strategies, and ATS optimization techniques.",
    type: "website",
    url: "https://markdowntailor.com/blog",
  },
  alternates: {
    types: {
      "application/rss+xml": "https://markdowntailor.com/api/rss",
    },
  },
};

export default async function BlogIndex() {
  const posts = await getPosts();

  // Generate blog list schema
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog",
    description:
      "Expert advice on resume building, job hunting strategies, and ATS optimization",
    url: "https://markdowntailor.com/blog",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || `Read about ${post.title}`,
      datePublished: post.publishedOn,
      url: `https://markdowntailor.com/blog/${post.slug}`,
      author: {
        "@type": "Organization",
        name: "markdowntailor Team",
      },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Add structured data for blog list */}
      <Script
        id="blog-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema),
        }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
      />
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8 last:border-b-0">
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-200">
                {post.title}
              </h2>
            </Link>

            <p className="mt-3 text-gray-600 dark:text-gray-300">
              {post.description || `Read about ${post.title}`}
            </p>

            <div className="mt-4 text-sm text-gray-500">
              {new Date(post.publishedOn).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="text-gray-500">No blog posts found.</p>
        )}
      </div>
    </div>
  );
}
