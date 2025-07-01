import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { cache } from "react";

// Type for blog post metadata
interface Frontmatter {
  title: string;
  seoTitle: string;
  description: string;
  publishedOn: string;
  slug: string;
  body: string;
}

// Type for blog post metadata
interface Post extends Frontmatter {
  content: string;
}

// \`cache\` is a React 18 feature that allows you to cache a function for the lifetime of a request.
// this means getPosts() will only be called once per page build, even though we may call it multiple times
// when rendering the page.
export const getPosts = cache(async () => {
  const postsDirectory = path.join(process.cwd(), "posts");
  const posts = await fs.readdir(postsDirectory);

  return Promise.all(
    posts

      .map(async (file) => {
        const filePath = `posts/${file}`;
        const postContent = await fs.readFile(filePath, "utf8");
        const { data, content } = matter(postContent);
        return { ...data, content } as Post;
      })
      .filter((post) => {
        return post !== null;
      }),
  );
});

export async function getPost(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

export default getPosts;
