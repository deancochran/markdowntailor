import { Separator } from "@/components/ui/separator";
import { getPost } from "@/lib/blog";
import { components } from "@/mdx-components";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  // If post doesn't exist, show 404 page
  if (!post) {
    notFound();
  }

  return {
    title: post.seoTitle || post.title,
    description: post.description,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedOn,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Get post data
  const { slug } = await params;
  const post = await getPost(slug);

  // Double-check that post exists (in case layout didn't catch it)
  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Back to blog link */}
      <div className="mb-4">
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
        <h1 className="text-5xl font-bold mb-2">{post.title}</h1>
        <div className="text-gray-500 mb-8">
          Published on{" "}
          {new Date(post.publishedOn).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <Separator className="mb-8" />
        <div>
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                remarkPlugins: [
                  // Adds support for GitHub Flavored Markdown
                  remarkGfm,
                  // generates a table of contents based on headings
                  remarkToc,
                ],
                // These work together to add IDs and linkify headings
                rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
              },
            }}
            components={components}
          />
        </div>
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
            image: "https://markdowntailor.com/logo.png",
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
    </>
  );
}

export const dynamicParams = true;
