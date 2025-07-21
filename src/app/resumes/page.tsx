"use client";

import ResumeEditorLoadingSkeleton from "@/components/loading/ResumeEditorLoadingSkeleton";
import ResumeListing from "@/components/resume-listing";
import ResumeEditor from "@/components/ResumeEditor";
import ResumeVersions from "@/components/ResumeVersions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { db, Resume, ResumeVersion } from "@/localforage";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// A wrapper component to ensure useSearchParams is used within a Suspense boundary
function ResumePageContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  const view = searchParams.get("view");

  if (uuid) {
    if (view === "versions") {
      return <ResumeVersionsWrapper resumeId={uuid} />;
    }
    return <ResumeEditorWrapper resumeId={uuid} />;
  }

  return <ResumeListingWrapper />;
}

function ResumeListingWrapper() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  useEffect(() => {
    async function fetchData() {
      const resumes = await db.resumes.findAll();
      if (resumes) {
        setResumes(resumes);
      } else {
        console.error("Failed to fetch resumes");
      }
    }

    fetchData();
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Resumes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create, manage, and export your professional resumes
            </p>
          </div>
        </div>
      </header>

      <ResumeListing initialResumes={resumes} />
    </div>
  );
}

function ResumeEditorWrapper({ resumeId }: { resumeId: string }) {
  const [resume, setResume] = useState<Resume>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await db.resumes.findById(resumeId)) ?? undefined;
        if (!cancelled) setResume(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  if (loading) {
    return <ResumeEditorLoadingSkeleton />;
  }
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

  return <ResumeEditor resume={resume} />;
}

function ResumeVersionsWrapper({ resumeId }: { resumeId: string }) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await db.resumeVersions.findAllByResumeId(resumeId)) ?? [];
        if (!cancelled) setVersions(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  if (loading) {
    // You can create a specific loading skeleton for versions
    return <div>Loading versions...</div>;
  }

  if (versions?.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">
              No versions found
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              There are no versions for the resume you&apos;re looking for.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ResumeVersions versions={versions} />;
}

export default function ResumesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
