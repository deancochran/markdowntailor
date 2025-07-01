import AppFooter from "@/components/AppFooter";
import { Metadata } from "next";
import { headers } from "next/headers";

// Default metadata for public pages
export async function generateMetadata(): Promise<Metadata> {
  // Get the pathname
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Define page-specific metadata
  const pageMetadata: Record<string, { title: string; description: string }> = {
    "/": {
      title: "markdowntailor - ATS-Optimized Resume Builder",
      description:
        "Create ATS-friendly resumes that get past screening systems and into the hands of hiring managers.",
    },
    "/about": {
      title: "About markdowntailor - Our Mission and Story",
      description:
        "Learn about our mission to help job seekers get their resumes seen by optimizing for ATS systems.",
    },
    "/features": {
      title: "Features - markdowntailor Resume Builder",
      description:
        "Discover the powerful features that make markdowntailor the best tool for creating ATS-optimized resumes.",
    },
    "/pricing": {
      title: "Pricing Plans - markdowntailor",
      description:
        "Affordable plans for creating professional, ATS-optimized resumes with markdowntailor.",
    },
    "/blog": {
      title: "Blog - Resume Tips & Career Advice | markdowntailor",
      description:
        "Expert advice on resume building, job hunting strategies, and ATS optimization techniques.",
    },
    "/privacy-policy": {
      title: "Privacy Policy - markdowntailor",
      description:
        "Our privacy policy explains how we collect, use, and protect your personal information.",
    },
    "/terms-of-service": {
      title: "Terms of Service - markdowntailor",
      description:
        "Read our terms of service to understand the rules and guidelines for using markdowntailor.",
    },
  };

  const currentPage =
    pathname in pageMetadata
      ? pageMetadata[pathname]
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
      type: "website",
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
    },
    twitter: {
      card: "summary_large_image",
      title: currentPage.title,
      description: currentPage.description,
      creator: "@markdowntailor",
      images: [`${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`],
    },
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
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="prose prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white">
          {children}
        </div>
      </div>

      <AppFooter />
    </>
  );
}
