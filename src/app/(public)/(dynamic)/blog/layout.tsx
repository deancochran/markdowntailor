import AppFooter from "@/components/AppFooter";
import { getPosts } from "@/lib/blog";
import { Metadata } from "next";
import { headers } from "next/headers";

// Default metadata for public pages
export async function generateMetadata(): Promise<Metadata> {
  // Get the pathname
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Get blog posts for SEO
  const posts = await getPosts();

  // Define page-specific metadata
  const pageMetadata: Record<string, { title: string; description: string }> =
    {};

  // Add blog post specific metadata
  posts.forEach((post) => {
    pageMetadata[`/blog/${post.slug}`] = {
      title: post.seoTitle || post.title,
      description: post.description || `Read our post about ${post.title}`,
    };
  });

  // Get metadata for current page or use defaults
  // Check if this is a blog post page
  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog/";
  const blogSlug = isBlogPost ? pathname.replace("/blog/", "") : "";
  const blogPost = isBlogPost
    ? posts.find((post) => post.slug === blogSlug)
    : null;

  // Determine current page metadata
  const currentPage = blogPost
    ? {
        title: blogPost.seoTitle || blogPost.title,
        description:
          blogPost.description || `Read our post about ${blogPost.title}`,
      }
    : {
        title: "markdowntailor - ATS-Optimized Resume Builder",
        description:
          "Create powerful, ATS-friendly resumes with our markdown-based resume builder.",
      };

  // Construct canonical URL
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`;

  return {
    title: currentPage.title,
    description: currentPage.description,
    keywords: [
      "resume maker",
      "cv maker",
      "curriculum vitae maker",
      "markdown resume",
      "resume builder",
      "ATS optimization",
      "markdown resume",
      "job application",
      "career tools",
      "resume parser",
      "job search",
    ],
    authors: [{ name: "markdowntailor Team" }],
    creator: "markdowntailor",
    publisher: "markdowntailor",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: isBlogPost ? "article" : "website",
      url: canonicalUrl,
      title: currentPage.title,
      description: currentPage.description,
      siteName: "markdowntailor",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
          width: 1200,
          height: 630,
          alt: currentPage.title,
        },
      ],
      ...(isBlogPost && blogPost
        ? {
            publishedTime: blogPost.publishedOn,
            authors: ["markdowntailor Team"],
            tags: [
              "resume maker",
              "cv maker",
              "curriculum vitae maker",
              "markdown resume",
              "resume builder",
              "ATS optimization",
              "markdown resume",
              "job application",
              "career tools",
              "resume parser",
              "job search",
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: currentPage.title,
      description: currentPage.description,
      creator: "@markdowntailor",
      images: [`${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`],
    },
    ...(isBlogPost && blogPost
      ? {
          alternates: {
            canonical: canonicalUrl,
            types: {
              "application/rss+xml": `${process.env.NEXT_PUBLIC_BASE_URL}/api/rss`,
            },
          },
        }
      : {}),
    verification: {
      // Add your verification codes when ready
      // google: "google-site-verification-code",
      // yandex: "yandex-verification-code",
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full items-center justify-between">
      <div className="max-w-2xl w-full p-4">{children}</div>

      <AppFooter />
    </div>
  );
}
