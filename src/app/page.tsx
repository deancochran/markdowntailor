import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDown, FileEdit, GitFork } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Resume Builder
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Create professional resumes with the power of Markdown
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/resumes">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <FileEdit className="h-6 w-6 text-primary" />
            <CardTitle className="mt-2">Simple Editing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Edit your resume using Markdown, with a live preview to see
              changes instantly.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <FileDown className="h-6 w-6 text-primary" />
            <CardTitle className="mt-2">Export to PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generate professional PDFs with a single click, ready to send to
              potential employers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <GitFork className="h-6 w-6 text-primary" />
            <CardTitle className="mt-2">Version Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create multiple versions of your resume for different job
              applications.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to create your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              Click <strong>Get Started</strong> to see your resume collection
            </li>
            <li>Create a new resume or select an existing one to edit</li>
            <li>Use Markdown to format your resume content</li>
            <li>
              Click <strong>Save</strong> to store your changes
            </li>
            <li>
              Use <strong>Print PDF</strong> to generate a PDF version
            </li>
            <li>
              Alternatively, use <strong>Download HTML</strong> and open in a
              browser to print
            </li>
          </ol>
          <div className="mt-6 border-l-4 p-4 rounded  ">
            <p>
              <strong>Note:</strong> If you encounter issues with PDF downloads,
              try the HTML download option.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
