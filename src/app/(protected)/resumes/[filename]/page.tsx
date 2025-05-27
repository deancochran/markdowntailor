import ResumeEditor from "@/components/ResumeEditor";
import { selectResumeSchema } from "@/db/schema";
import { getResume } from "@/lib/actions/resume";
import { Suspense } from "react";

interface PageProps {
  params: {
    filename: string;
  };
}

export default async function EditorPage({ params }: PageProps) {
  const filename = (await params).filename;
  const resume = await getResume(filename);
  if (!resume) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Resume not found</h2>
          <p>
            The resume you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  const validation = selectResumeSchema.safeParse(resume);

  if (!validation.success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid resume data</h2>
          <p>The resume data is corrupted or in an invalid format.</p>
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResumeEditor resume={validation.data} />
    </Suspense>
  );
}
