import { getPost } from "@/lib/blog";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

// Generate metadata for blog posts
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  // Return 404 if post not found
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found",
    };
  }

  // Base URL for canonical links and images
  const baseUrl = "https://markdowntailor.com";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: post.seoTitle || post.title,
    description: post.description || `Read our post about ${post.title}`,
    openGraph: {
      type: "article",
      url: postUrl,
      title: post.seoTitle || post.title,
      description: post.description || "",
      publishedTime: post.publishedOn,
      authors: ["markdowntailor Team"],
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.description || "",
      creator: "@markdowntailor",
      images: [`${baseUrl}/twitter-image.png`],
    },
    alternates: {
      canonical: postUrl,
      types: {
        "application/rss+xml": `${baseUrl}/api/rss`,
      },
    },
  };
}

export default async function MdxLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  // If post doesn't exist, show 404 page
  if (!post) {
    notFound();
  }
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back to blog link */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to all posts
        </Link>
      </div>

      {/* Blog content - styling now handled by BlogPost component */}
      <div className="prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-500 mb-8">
          Published on{" "}
          {new Date(post.publishedOn).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        {children}
      </div>

      {/* Add structured data for this blog post */}
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description || "",
            image: "https://markdowntailor.com/og-image.png",
            datePublished: post.publishedOn,
            dateModified: post.publishedOn,
            author: {
              "@type": "Organization",
              name: "markdowntailor Team",
              url: "https://markdowntailor.com",
            },
            publisher: {
              "@type": "Organization",
              name: "markdowntailor",
              logo: {
                "@type": "ImageObject",
                url: "https://markdowntailor.com/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://markdowntailor.com/blog/${post.slug}`,
            },
          }),
        }}
      />
    </div>
  );
}
