import BlogPost from "@/components/BlogPost";
import fs from "fs";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import path from "path";

// Type for the params
type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = params.slug;

  try {
    // Try to read the MDX file to get its metadata
    const postPath = path.join(process.cwd(), "src/posts", `${slug}.mdx`);
    const fileContent = fs.readFileSync(postPath, "utf8");

    // Extract frontmatter
    const metadataMatch = fileContent.match(/---\n([\s\S]*?)\n---/);
    const metadata: Record<string, string> = {};

    if (metadataMatch && metadataMatch[1]) {
      const frontmatter = metadataMatch[1];
      frontmatter.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(":").trim();
        }
      });
    }

    return {
      title: metadata.seoTitle || metadata.title || `Blog - ${slug}`,
      description: metadata.abstract || `Blog post about ${slug}`,
    };
  } catch (error) {
    return {
      title: `Blog - ${slug}`,
      description: `Blog post about ${slug}`,
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = params;

  try {
    // Check if the post exists
    const postPath = path.join(process.cwd(), "src/posts", `${slug}.mdx`);
    if (!fs.existsSync(postPath)) {
      notFound();
    }

    // Next.js handles MDX imports and automatically excludes frontmatter from rendering
    const { default: Post } = await import(`@/posts/${slug}.mdx`);

    // Read file to get metadata for display
    const fileContent = fs.readFileSync(postPath, "utf8");
    const metadataMatch = fileContent.match(/---\n([\s\S]*?)\n---/);
    const metadata: Record<string, any> = {};

    if (metadataMatch && metadataMatch[1]) {
      const frontmatter = metadataMatch[1];
      frontmatter.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(":").trim();
        }
      });
    }

    // Format the date if it exists
    const formattedDate = metadata.publishedOn
      ? new Date(metadata.publishedOn).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    return (
      <div>
        {/* Post content wrapped in BlogPost component to ensure frontmatter isn't rendered */}
        <BlogPost
          meta={{
            title: metadata.title,
            publishedOn: metadata.publishedOn,
            abstract: metadata.abstract,
          }}
        >
          <Post />
        </BlogPost>
      </div>
    );
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    notFound();
  }
}

export function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/posts");

  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    return fileNames
      .filter((fileName) => fileName.endsWith(".mdx"))
      .map((fileName) => ({
        slug: fileName.replace(/\.mdx$/, ""),
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export const dynamicParams = false;
