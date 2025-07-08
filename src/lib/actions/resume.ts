"use server";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { resume, resumeVersions, UpdateResumeSchema } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sanitizeResumeInput } from "../utils/sanitization";

// Define a schema for creating a resume
const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  markdown: z.string().optional(),
  css: z.string().optional(),
  styles: z
    .string()
    .default(
      '{"fontFamily":"Inter","fontSize":11,"lineHeight":1.4,"marginH":20,"marginV":20}',
    )
    .optional(),
});

export const createResume = async (
  values: z.infer<typeof createResumeSchema>,
) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a resume");
  }

  const validatedFields = createResumeSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Failed to create Resume");
  }

  const [newResume] = await db
    .insert(resume)
    .values({
      ...validatedFields.data,
      userId: session.user.id,
    })
    .returning();

  revalidatePath("/resumes");
  return newResume;
};

export const getResume = async (resumeId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [resumeData] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  return resumeData;
};

export const getResumes = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const resumes = await db
    .select()
    .from(resume)
    .where(eq(resume.userId, session.user.id))
    .orderBy(desc(resume.updatedAt));

  return resumes;
};

const resumeUpdateSchema = z.object({
  title: z.string().min(1).max(100),
  markdown: z.string().max(10000).default(""),
  css: z.string().max(10000).default(""),
  styles: z
    .string()
    .max(1000)
    .default(
      '{"fontFamily":"Inter","fontSize":11,"lineHeight":1.4,"marginH":20,"marginV":20}',
    ),
});

// Update the saveResume function (around line 75)
export const saveResume = async (
  resumeId: string,
  values: z.infer<UpdateResumeSchema>,
) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Sanitize input before validation
  const sanitizedInput = sanitizeResumeInput(values);

  const validatedFields = resumeUpdateSchema.safeParse(sanitizedInput);

  if (!validatedFields.success) {
    throw new Error(
      "Must provide valid input for title, css, markdown, and styles",
    );
  }

  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error("Resume not found or you don't have permission to edit it");
  }

  const latestVersions = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, resumeId))
    .orderBy(desc(resumeVersions.version))
    .limit(1);

  const currentVersion =
    latestVersions.length > 0 ? latestVersions[0].version : 0;
  const newVersion = currentVersion + 1;

  const [updated_resume] = await db
    .update(resume)
    .set({
      title: validatedFields.data.title,
      markdown: validatedFields.data.markdown,
      css: validatedFields.data.css,
      styles: validatedFields.data.styles,
    })
    .where(eq(resume.id, resumeId))
    .returning();

  await db.insert(resumeVersions).values({
    ...validatedFields.data,
    version: newVersion,
    resumeId: resumeId,
  });

  return updated_resume;
};

export const deleteResume = async (resumeId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error(
      "Resume not found or you don't have permission to delete it",
    );
  }

  await db.delete(resume).where(eq(resume.id, resumeId));
};

export const getResumeVersions = async (resumeId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error(
      "Resume not found or you don't have permission to view versions",
    );
  }

  const versions = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, resumeId))
    .orderBy(desc(resumeVersions.version));

  return versions;
};

export const restoreVersion = async (formData: FormData) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const resumeId = formData.get("resumeId") as string;
  const versionId = formData.get("versionId") as string;

  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error("Resume not found or you don't have permission");
  }

  const [versionToRestore] = await db
    .select()
    .from(resumeVersions)
    .where(
      and(
        eq(resumeVersions.id, versionId),
        eq(resumeVersions.resumeId, resumeId),
      ),
    );

  if (!versionToRestore) {
    throw new Error("Version not found");
  }

  // Sanitize the data being restored
  const sanitizedData = sanitizeResumeInput({
    title: versionToRestore.title,
    markdown: versionToRestore.markdown,
    css: versionToRestore.css,
  });

  const latestVersions = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, resumeId))
    .orderBy(desc(resumeVersions.version))
    .limit(1);

  const currentVersion =
    latestVersions.length > 0 ? latestVersions[0].version : 0;
  const newVersion = currentVersion + 1;

  await db
    .update(resume)
    .set({
      title: sanitizedData.title,
      markdown: sanitizedData.markdown,
      css: sanitizedData.css,
      updatedAt: new Date(),
    })
    .where(eq(resume.id, resumeId));

  await db.insert(resumeVersions).values({
    title: sanitizedData.title,
    markdown: sanitizedData.markdown,
    css: sanitizedData.css,
    version: newVersion,
    resumeId: resumeId,
  });

  revalidatePath(`/resumes/${resumeId}`);
  return { success: true };
};

export const createResumeFromVersion = async (resumeId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error("Resume not found or you don't have permission");
  }

  const [newResume] = await db
    .insert(resume)
    .values({
      userId: session.user.id,
      title: `${existingResume.title} (Copy)`,
      markdown: existingResume.markdown,
      css: existingResume.css,
    })
    .returning();

  return { success: true, resumeId: newResume.id };
};

export const getResumeVersion = async (versionId: string, resumeId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error("Resume not found or you don't have permission");
  }

  const [version] = await db
    .select()
    .from(resumeVersions)
    .where(
      and(
        eq(resumeVersions.id, versionId),
        eq(resumeVersions.resumeId, resumeId),
      ),
    );

  return version;
};
