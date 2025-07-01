"use client";

import Head from "next/head";
import Script from "next/script";
import { FC } from "react";

interface SEOProps {
  /**
   * Schema.org structured data to be included as JSON-LD
   */
  structuredData?: Record<string, unknown>;

  /**
   * Whether to include default organization schema
   */
  includeOrganizationSchema?: boolean;

  /**
   * Additional canonical URL (the primary one should be set in metadata)
   */
  canonicalUrl?: string;
}

/**
 * SEO component that can be used to add structured data and other
 * elements that can't be handled through Next.js metadata API
 *
 * Usage:
 * ```tsx
 * <SEO
 *   structuredData={generateBlogPostSchema({...})}
 *   includeOrganizationSchema={true}
 * />
 * ```
 */
const SEO: FC<SEOProps> = ({
  structuredData,
  includeOrganizationSchema = false,
  canonicalUrl,
}) => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "markdowntailor",
    url: "https://markdowntailor.com",
    logo: "https://markdowntailor.com/logo.png", // Using existing logo
    sameAs: [
      // Simplified social profiles - only include active ones
      // If none are active yet, you can leave this as an empty array
      // "https://twitter.com/markdowntailor",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@markdowntailor.com",
      contactType: "customer service",
    },
  };

  return (
    <>
      {/* Add canonical URL if provided */}
      {canonicalUrl && (
        <Head>
          <link rel="canonical" href={canonicalUrl} />
        </Head>
      )}

      {/* Add structured data for the page if provided */}
      {structuredData && (
        <Script
          id="page-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Add organization schema if requested */}
      {includeOrganizationSchema && (
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      )}
    </>
  );
};

export default SEO;
