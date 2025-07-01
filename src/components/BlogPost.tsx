import React from 'react';

type BlogPostProps = {
  children: React.ReactNode;
  meta?: {
    title?: string;
    publishedOn?: string;
    author?: string;
    abstract?: string;
  };
};

/**
 * BlogPost component for rendering MDX blog content
 * This ensures proper styling and layout for blog posts while
 * ensuring frontmatter data doesn't appear in the rendered output
 */
const BlogPost: React.FC<BlogPostProps> = ({ children, meta }) => {
  // Format the date if it exists
  const formattedDate = meta?.publishedOn
    ? new Date(meta.publishedOn).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <article className="blog-post">
      {meta?.title && (
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{meta.title}</h1>
          {formattedDate && (
            <div className="text-gray-500 mb-2">{formattedDate}</div>
          )}
          {meta.author && (
            <div className="text-gray-600 dark:text-gray-400">
              By {meta.author}
            </div>
          )}
          {meta.abstract && (
            <div className="mt-4 text-lg text-gray-700 dark:text-gray-300 italic">
              {meta.abstract}
            </div>
          )}
        </header>
      )}

      <div className="blog-content prose prose-lg max-w-none
        prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-6
        prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
        prose-h4:text-xl prose-h5:text-lg prose-h6:text-base
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700
        prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400
        prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-md
        prose-img:rounded-md prose-img:shadow-md
        prose-hr:border-gray-200 dark:prose-hr:border-gray-800
        prose-ul:pl-5 prose-ol:pl-5
        prose-li:my-2">
        {children}
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Thanks for reading! If you enjoyed this post, consider sharing it with
          others.
        </p>
      </div>
    </article>
  );
};

export default BlogPost;
