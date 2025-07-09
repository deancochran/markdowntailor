import AppFooter from "@/components/AppFooter";
import { getPosts } from "@/lib/blog";
import { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";

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
        title: "Blog - Resume Tips & Career Advice | markdowntailor",
        description:
          "Expert advice on resume building, job hunting strategies, and ATS optimization techniques.",
      };

  // Construct canonical URL
  const canonicalUrl = pathname;

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
          url: `/logo.png`,
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
      images: [`/logo.png`],
    },
    ...(isBlogPost && blogPost
      ? {
          alternates: {
            canonical: canonicalUrl,
            types: {
              "application/rss+xml": `/api/rss`,
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
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const posts = await getPosts();

  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog/";
  const blogSlug = isBlogPost ? pathname.replace("/blog/", "") : "";
  const blogPost = isBlogPost
    ? posts.find((post) => post.slug === blogSlug)
    : null;

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://markdowntailor.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `https://markdowntailor.com/blog`,
    },
  ];

  if (isBlogPost && blogPost) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: blogPost.title,
      item: `https://markdowntailor.com/blog/${blogPost.slug}`,
    });
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-between">
      <div className="max-w-2xl w-full p-4">{children}</div>

      <AppFooter />

      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbItems,
          }),
        }}
      />

      {isBlogPost && blogPost && (
        <Script
          id="blog-post-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://markdowntailor.com/blog/${blogPost.slug}`,
              },
              headline: blogPost.seoTitle || blogPost.title,
              description:
                blogPost.description || `Read our post about ${blogPost.title}`,
              image: `https://markdowntailor.com/logo.png`,
              author: {
                "@type": "Organization",
                name: "markdowntailor",
                url: "https://markdowntailor.com",
              },
              publisher: {
                "@type": "Organization",
                name: "markdowntailor",
                logo: {
                  "@type": "ImageObject",
                  url: `https://markdowntailor.com/logo.png`,
                },
              },
              datePublished: blogPost.publishedOn,
            }),
          }}
        />
      )}
    </div>
  );
}
