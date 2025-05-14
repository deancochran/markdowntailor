// src/app/editor/[filename]/page.tsx
import EditorClientWrapper from "@/components/EditorClientWrapper";
import { Metadata } from "next";

type PageParams = {
  params: {
    filename: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  // Your metadata logic here
  const { filename } = await params;
  return {
    title: `Editing ${filename}`,
    // other metadata
  };
}

export default async function EditorPage({ params }: PageParams) {
  const { filename } = await params;
  return <EditorClientWrapper filename={filename} />;
}
