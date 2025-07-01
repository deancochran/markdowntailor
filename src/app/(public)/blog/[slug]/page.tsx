import { getPost } from "@/lib/blog";
import { components } from "@/mdx-components";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found",
    };
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
  params: {
    slug: string;
  };
}) {
  // Get post data
  const { slug } = await params;
  const post = await getPost(slug);

  // Double-check that post exists (in case layout didn't catch it)
  if (!post) {
    notFound();
  }

  return (
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
  );
}

export const dynamicParams = true;
