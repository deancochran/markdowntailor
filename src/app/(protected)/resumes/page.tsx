"use client";
import ResumeList from "@/components/ResumeList";

export default function ResumesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create, manage, and export your resumes
          </p>
        </header>
        <ResumeList />
      </div>
    </div>
  );
}
