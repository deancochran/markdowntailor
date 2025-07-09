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
      title: "ATS-Optimized Resume Builder to Get You Hired | markdowntailor",
      description:
        "Build, Create, and Tailor ATS-friendly resumes that get past screening systems and into the hands of hiring managers.",
    },
    "/about": {
      title: "Our Mission to Help You Get Hired | markdowntailor",
      description:
        "Learn about our mission to help job seekers get their resumes seen by building resumes; optimizing and tailoring them for ATS systems.",
    },
    "/features": {
      title: "Features of Our ATS-Friendly Resume Builder | markdowntailor",
      description:
        "Discover the powerful features that make markdowntailor the best tool for creating ATS-optimized resumes.",
    },
    "/pricing": {
      title: "Affordable Resume Builder Pricing | markdowntailor",
      description:
        "Affordable plans for creating professional, ATS-optimized resumes with markdowntailor.",
    },
    "/blog": {
      title: "Resume Tips & Career Advice Blog | markdowntailor",
      description:
        "Expert advice on resume building, job hunting strategies, and ATS optimization techniques.",
    },
    "/privacy-policy": {
      title: "Privacy Policy | markdowntailor",
      description:
        "Our privacy policy explains how we collect, use, and protect your personal information.",
    },
    "/terms-of-service": {
      title: "Terms of Service | markdowntailor",
      description:
        "Read our terms of service to understand the rules and guidelines for using markdowntailor.",
    },
  };

  const currentPage =
    pathname in pageMetadata
      ? pageMetadata[pathname]
      : {
          title: "ATS-Optimized Resume Builder | markdowntailor",
          description:
            "Create powerful, ATS-friendly resumes with our markdown and css resume builder.",
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
      type: "website",
      url: canonicalUrl,
      title: currentPage.title,
      description: currentPage.description,
      siteName: "markdowntailor",
      images: [
        {
          url: "/logo.png",
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
      images: ["/logo.png"],
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
    <div className="flex flex-col h-full w-full items-center justify-between">
      <div className="max-w-2xl w-full p-4">{children}</div>

      <AppFooter />
    </div>
  );
}
