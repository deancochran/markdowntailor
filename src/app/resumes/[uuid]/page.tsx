"use client";
import ResumeEditorLoadingSkeleton from "@/components/loading/ResumeEditorLoadingSkeleton";
import ResumeEditor from "@/components/ResumeEditor";
import { db, Resume } from "@/localforage";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function ResumeVersionsPage() {
  const { uuid } = useParams<{ uuid: string }>(); // dynamic segment

  const [resume, setResume] = useState<Resume>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await db.resumes.findById(uuid)) ?? undefined;
        if (!cancelled) setResume(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uuid]);

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

  return (
    <Suspense fallback={<ResumeEditorLoadingSkeleton />}>
      <ResumeEditor resume={resume} />
    </Suspense>
  );
}
