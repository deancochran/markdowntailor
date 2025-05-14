"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Resume {
  filename: string;
  path: string;
}

// Form schema for resume creation
const createResumeSchema = z.object({
  resumeName: z.string().min(1, "Resume name is required"),
});

type CreateResumeFormValues = z.infer<typeof createResumeSchema>;

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Define form
  const form = useForm<CreateResumeFormValues>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      resumeName: "",
    },
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch("/api/resumes");
        if (!response.ok) {
          throw new Error("Failed to fetch resumes");
        }
        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (err) {
        setError("Error loading resumes");
        // Only log errors in non-test environments
        if (process.env.NODE_ENV !== "test") {
          console.error("Error loading resumes:", err);
        }
        toast.error("Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleCreateNewResume = async (data: CreateResumeFormValues) => {
    if (!data.resumeName.trim()) return;

    setIsCreating(true);

    // Import utility functions
    const { sanitizeFilename, createDefaultResume, isValidResumeName } =
      await import("../utils/resumeUtils");

    if (!isValidResumeName(data.resumeName)) {
      setError("Invalid resume name. Please use a different name.");
      toast.error("Invalid resume name");
      setIsCreating(false);
      return;
    }

    const sanitizedName = sanitizeFilename(data.resumeName.trim());
    try {
      const response = await fetch(`/api/resumes/${sanitizedName}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: createDefaultResume(data.resumeName.trim()),
      });

      if (!response.ok) {
        throw new Error("Failed to create new resume");
      }

      toast.success("Resume created successfully");

      // Navigate to the new resume
      router.push(`/editor/${sanitizedName}`);
    } catch (err) {
      setError("Error creating new resume");
      // Only log errors in non-test environments
      if (process.env.NODE_ENV !== "test") {
        console.error("Error creating new resume:", err);
      }
      toast.error("Failed to create resume");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-2" data-testid="loading-skeleton">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-2">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={20} className="text-destructive" />
              <span>Error</span>
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-2">
      <Card className="mb-8">
        <CardHeader className="px-6 py-4">
          <CardTitle>Create New Resume</CardTitle>
          <CardDescription>
            Enter a name for your new resume to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateNewResume)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="resumeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter resume name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Resume"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No resumes found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Create your first resume using the form above to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card
              key={resume.filename}
              className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full"
            >
              <Link href={`/editor/${resume.filename}`} className="flex-1">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-xl">{resume.filename}</CardTitle>
                  <CardDescription>Resume document</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-2 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Last modified: {new Date().toLocaleDateString()}
                  </p>
                </CardContent>
              </Link>
              <CardFooter className="mt-auto flex items-center justify-end">
                <Link href={`/editor/${resume.filename}`}>
                  <Button size="sm">Edit Resume</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeList;
