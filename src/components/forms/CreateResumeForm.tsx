"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Session } from "next-auth";
import { useTransition } from "react";
import { toast } from "sonner";

export function CreateResumeForm({ session }: { session: Session }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<InsertResumeSchema>>({
    resolver: zodResolver(insertResumeSchema),
    defaultValues: {
      title: "Test Resume",
      userId: session.user.id,
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;
  function onSubmit(values: z.infer<InsertResumeSchema>) {
    console.log(values);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransition(async () => {
      toast.promise(addResume(values), {
        loading: "Loading ...",
        success: (msg: string) => {
          form.reset();
          return msg;
        },
        error: (msg: string) => {
          return `${msg}`;
        },
      });
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {errors.title && <span>This field is required</span>}

        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="your resume title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
