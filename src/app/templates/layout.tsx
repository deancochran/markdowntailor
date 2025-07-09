import AppFooter from "@/components/AppFooter";
import { Metadata } from "next";

import { headers } from "next/headers";

// Default metadata for public pages
export async function generateMetadata(): Promise<Metadata> {
  // Get the pathname
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const currentPage = {
    title: "Professionally Designed Resume Templates | markdowntailor",
    description:
      "Choose from a collection of professionally designed, ATS-friendly resume templates to help you stand out and get hired.",
    pathname: "/templates",
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
      <div className="w-full p-4">{children}</div>

      <AppFooter />
    </div>
  );
}
