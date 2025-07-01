import fs from "fs";
import Link from "next/link";
import path from "path";

// Type for blog post metadata
interface PostMetadata {
  title: string;
  seoTitle?: string;
  abstract?: string;
  isPublished: boolean;
  publishedOn: string;
  slug: string;
}

// Function to get all blog posts
async function getBlogPosts(): Promise<PostMetadata[]> {
  const postsDirectory = path.join(process.cwd(), "src/posts");
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      // Remove ".mdx" from file name to get slug
      const slug = fileName.replace(/\.mdx$/, "");

      // Read file content
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Extract metadata from frontmatter
      const metadata = extractMetadata(fileContents);

      return {
        ...metadata,
        slug,
      };
    })
    .filter((post) => post.isPublished !== false) // Filter out explicitly unpublished posts
    .sort(
      (a, b) =>
        new Date(b.publishedOn).getTime() - new Date(a.publishedOn).getTime(),
    ); // Sort by date

  return posts;
}

// Function to extract metadata from frontmatter
function extractMetadata(content: string): Omit<PostMetadata, "slug"> {
  const metadataRegex = /---\n([\s\S]*?)\n---/;
  const match = content.match(metadataRegex);

  if (!match) {
    return {
      title: "Untitled",
      isPublished: true,
      publishedOn: new Date().toISOString(),
    };
  }

  const metadataString = match[1];
  const metadata: Record<string, any> = {};

  metadataString.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      const value = valueParts.join(":").trim();

      // Handle different value types
      if (value === "true") metadata[key.trim()] = true;
      else if (value === "false") metadata[key.trim()] = false;
      else if (value.startsWith('"') && value.endsWith('"'))
        metadata[key.trim()] = value.slice(1, -1);
      else metadata[key.trim()] = value;
    }
  });

  return {
    title: metadata.title || "Untitled",
    seoTitle: metadata.seoTitle,
    abstract: metadata.abstract,
    isPublished: metadata.isPublished !== false, // Default to published if not specified
    publishedOn: metadata.publishedOn || new Date().toISOString(),
  };
}

export default async function BlogIndex() {
  const posts = await getBlogPosts();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-8 last:border-b-0">
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl font-semibold hover:text-blue-600 transition-colors duration-200">
                {post.title}
              </h2>
            </Link>

            {post.abstract && (
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                {post.abstract}
              </p>
            )}

            <div className="mt-4 text-sm text-gray-500">
              {new Date(post.publishedOn).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="text-gray-500">No blog posts found.</p>
        )}
      </div>
    </div>
  );
}
