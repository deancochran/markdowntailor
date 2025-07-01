/**
 * SEO utility functions for the markdowntailor application
 * These utilities help with metadata generation, structured data, and other SEO-related tasks
 */

import { Metadata } from "next";
import { headers } from "next/headers";

// Type for SEO page metadata
export interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
  tags?: string[];
  authorName?: string;
}

/**
 * Generate canonical URL based on the current path
 */
export function getCanonicalUrl(path: string): string {
  // Remove trailing slash if it exists (except for homepage)
  const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
  return `${process.env.NEXT_PUBLIC_BASE_URL}${normalizedPath}`;
}

/**
 * Get the current pathname from headers
 */
export async function getCurrentPathname(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-pathname") || "/";
}

/**
 * Generate OpenGraph metadata for a page
 */
export function generateOpenGraph(props: PageSEOProps) {
  const {
    title,
    description,
    path,
    publishedTime: _publishedTime,
    modifiedTime: _modifiedTime,
    type = "website",
    image = "/logo.png", // Using logo.png as default
    imageAlt,
    tags: _tags,
    authorName: _authorName,
  } = props;

  const openGraph: Metadata["openGraph"] = {
    type,
    url: getCanonicalUrl(path),
    title,
    description,
    siteName: "markdowntailor",
    images: [
      {
        url: image.startsWith("http")
          ? image
          : `${process.env.NEXT_PUBLIC_BASE_URL}${image}`,
        width: 1200,
        height: 630,
        alt: imageAlt || title,
      },
    ],
  };
  if (!openGraph) throw new Error("Invalid  openGraph");

  return openGraph;
}
/**
 * Generate Twitter card metadata
 */
export function generateTwitterCard(props: PageSEOProps) {
  const { title, description, image = "/logo.png" } = props; // Using logo.png as default

  return {
    card: "summary_large_image",
    title,
    description,
    creator: "@markdowntailor",
    images: [
      image.startsWith("http")
        ? image
        : `${process.env.NEXT_PUBLIC_BASE_URL}${image}`,
    ],
    url: getCanonicalUrl("/"),
  };
}

export function generateBlogPostSchema(props: {
  title: string;
  description: string;
  slug: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  authorName?: string;
}) {
  const {
    title,
    description,
    slug,
    publishedDate,
    modifiedDate,
    image = "/logo.png", // Using logo.png as default
    authorName = "markdowntailor Team",
  } = props;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: image.startsWith("http")
      ? image
      : `${process.env.NEXT_PUBLIC_BASE_URL}${image}`,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      "@type": "Organization",
      name: authorName,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    },
    publisher: {
      "@type": "Organization",
      name: "markdowntailor",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${slug}`,
    },
  };
}

/**
 * Generate JSON-LD structured data for the organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "markdowntailor",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    sameAs: [
      "https://twitter.com/markdowntailor",
      "https://github.com/markdowntailor",
      "https://linkedin.com/company/markdowntailor",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@markdowntailor.com",
      contactType: "customer service",
    },
  };
}

/**
 * Generate complete metadata for a page
 */
export function generatePageMetadata(props: PageSEOProps): Metadata {
  const { title, description, path, type = "website" } = props;

  const canonicalUrl = getCanonicalUrl(path);

  return {
    title,
    description,
    keywords: [
      "resume builder",
      "ATS optimization",
      "markdown resume",
      "job application",
      "career tools",
      "resume parser",
      "job search",
    ],
    authors: [{ name: props.authorName || "markdowntailor Team" }],
    creator: "markdowntailor",
    publisher: "markdowntailor",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      ...(type === "article"
        ? {
            types: {
              "application/rss+xml": `${process.env.NEXT_PUBLIC_BASE_URL}/api/rss`,
            },
          }
        : {}),
    },
    openGraph: generateOpenGraph(props),
    twitter: generateTwitterCard(props),
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}
