// src/components/EditorClientWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const EditorContent = dynamic(() => import("@/components/EditorContent"), {
  ssr: false,
});

export default function EditorClientWrapper({
  filename,
}: {
  filename: string;
}) {
  return <EditorContent filename={filename} />;
}
