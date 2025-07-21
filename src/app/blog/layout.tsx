import AppFooter from "@/components/AppFooter";
import { getPosts } from "@/lib/blog";
import Script from "next/script";
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const posts = await getPosts();
  const {slug}= await params;
  const blogPost = posts.find((post) => post.slug === slug);

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


  if (blogPost) {
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

      {blogPost && (
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
