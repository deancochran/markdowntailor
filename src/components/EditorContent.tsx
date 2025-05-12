// components/EditorContent.tsx
"use client";

import MarkdownEditor from "@/components/MarkdownEditor";
import { Link } from "lucide-react";
import { useEffect, useState } from "react";

export default function EditorContent({ filename }: { filename: string }) {
  const [initialMarkdown, setInitialMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumeContent = async () => {
      try {
        const response = await fetch(`/api/resumes/${filename}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Resume "${filename}" not found`);
          } else {
            throw new Error(`Error fetching resume: ${response.statusText}`);
          }
        } else {
          const content = await response.text();
          setInitialMarkdown(content);
        }
      } catch (err) {
        setError("Error loading resume content");
        console.error("Error loading resume:", err);
      } finally {
        setLoading(false);
      }
    };

    if (filename) {
      fetchResumeContent();
    }
  }, [filename]);

  if (loading) {
    return <div className="p-8 text-center">Loading resume...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Link href="/resumes" className="text-blue-600 hover:underline">
          Go back to resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <MarkdownEditor
        initialMarkdown={initialMarkdown || ""}
        filename={filename}
      />
    </div>
  );
}
