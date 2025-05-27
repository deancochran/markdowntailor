"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { insertResumeSchema, type InsertResumeSchema } from "@/db/schema";
import { addResume } from "@/lib/actions/resume";
import {
  defaultCssTemplate,
  defaultMarkdownTemplate,
} from "@/lib/utils/resumeUtils";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function CreateResumeForm({ session }: { session: Session }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<InsertResumeSchema>>({
    resolver: zodResolver(insertResumeSchema),
    defaultValues: {
      userId: session.user.id,
      css: defaultCssTemplate(),
      markdown: defaultMarkdownTemplate(),
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const router = useRouter();

  function onSubmit(values: z.infer<InsertResumeSchema>) {
    startTransition(async () => {
      try {
        toast.promise(addResume(values), {
          loading: "Creating resume...",
          success: (id: string) => {
            router.push(`/resumes/${id}`);
            return "New Resume Added!";
          },
          error: (error) => {
            console.error("Failed to create resume:", error);
            return "Failed to create Resume";
          },
        });
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="My New Resume"
                      {...field}
                      aria-invalid={errors.title ? "true" : "false"}
                      aria-describedby={
                        errors.title ? "title-error" : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage id="title-error">
                    {errors.title && "This field is required"}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}
