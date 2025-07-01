import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
// Note: Frontmatter is handled by remark-frontmatter plugin
// and will not be rendered in the MDX content

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

// Custom components for callouts/notices
const Callout = ({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: "info" | "warning" | "error" | "success";
}) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300",
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300",
  };

  return (
    <div className={`p-4 my-6 border-l-4 rounded-r-md ${styles[type]}`}>
      {children}
    </div>
  );
};

// Component for code blocks with highlighting
const CodeBlock = ({
  children,
  language,
}: {
  children: ReactNode;
  language?: string;
}) => {
  return (
    <div className="relative my-6">
      {language && (
        <div className="absolute right-4 top-2 text-xs text-gray-500 dark:text-gray-400">
          {language}
        </div>
      )}
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
        <code className="text-sm font-mono">{children}</code>
      </pre>
    </div>
  );
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100">
        {children}
      </h6>
    ),

    // Paragraphs and text formatting
    p: ({ children }) => (
      <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="my-4 ml-6 list-disc text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 list-decimal text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="my-1">{children}</li>,

    // Block elements
    blockquote: ({ children }) => (
      <blockquote className="pl-4 my-6 border-l-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 italic">
        {children}
      </blockquote>
    ),

    // Images with Next.js Image component
    img: (props) => (
      <div className="my-6">
        <Image
          sizes="100vw"
          className="rounded-md"
          style={{ width: "100%", height: "auto" }}
          {...(props as ImageProps)}
          alt={props.alt || ""}
        />
        {props.alt && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            {props.alt}
          </p>
        )}
      </div>
    ),

    // Links with Next.js Link for internal navigation
    a: ({ href, children, ...props }) => {
      const isInternal =
        href && !href.startsWith("http") && !href.startsWith("#");

      if (isInternal) {
        return (
          <Link
            href={href || ""}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          >
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },

    // Code formatting
    code: ({ children, className }) => {
      // Check if this is an inline code or a code block
      const match = /language-(\w+)/.exec(className || "");

      if (match) {
        return <CodeBlock language={match[1]}>{children}</CodeBlock>;
      }

      return (
        <code className="px-1.5 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
          {children}
        </code>
      );
    },

    // Horizontal rule
    hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,

    // Tables
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
        {children}
      </tbody>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {children}
      </td>
    ),

    // Custom components
    Callout: Callout,

    // Preserve any components passed in
    ...components,
  };
}
