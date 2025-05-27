"use server";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import {
  insertResumeSchema,
  type InsertResumeSchema,
  resume,
  resumeVersions,
  UpdateResumeSchema,
  updateResumeSchema,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type Toast = {
  description: string;
};

/**
 * Create a new resume
 */
export async function addResume(values: z.infer<InsertResumeSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a resume");
  }
  const validatedFields = insertResumeSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Failed to create Resume");
  }
  // Create new resume
  const [newResume] = await db
    .insert(resume)
    .values({
      ...values,
      userId: session.user.id,
    })
    .returning();
  return newResume.id;
}

/**
 * Get a resume by ID
 */
export async function getResume(resumeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [resumeData] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  return resumeData;
}

/**
 * Get all resumes for the current user
 */
export async function getResumes() {
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
}

/**
 * Save a resume and create a new version
 */
export async function saveResume(values: z.infer<UpdateResumeSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validatedFields = updateResumeSchema.safeParse(values);

  if (!validatedFields.success) {
    return `Failed to create Resume`;
  }

  // Check if user owns this resume
  const [existingResume] = await db
    .select()
    .from(resume)
    .where(
      and(
        eq(resume.id, validatedFields.data.id),
        eq(resume.userId, session.user.id),
      ),
    );

  if (!existingResume) {
    throw new Error("Resume not found or you don't have permission to edit it");
  }

  // Get current version number
  const latestVersions = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, validatedFields.data.id))
    .orderBy(desc(resumeVersions.version))
    .limit(1);

  const currentVersion =
    latestVersions.length > 0 ? latestVersions[0].version : 0;
  const newVersion = currentVersion + 1;

  // Update resume
  await db
    .update(resume)
    .set({
      title: validatedFields.data.title,
      markdown: validatedFields.data.markdown,
      css: validatedFields.data.css,
      content: validatedFields.data.content,
    })
    .where(eq(resume.id, validatedFields.data.id));

  // Create new version
  const [updated_resume] = await db
    .insert(resumeVersions)
    .values({
      title: validatedFields.data.title,
      markdown: validatedFields.data.markdown,
      css: validatedFields.data.css,
      content: validatedFields.data.content,
      version: newVersion,
      resumeId: validatedFields.data.id,
    })
    .returning();

  revalidatePath(`/resumes/${updated_resume.id}`);
  return { success: true };
}

/**
 * Delete a resume
 */
export async function deleteResume(resumeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if user owns this resume
  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error(
      "Resume not found or you don't have permission to delete it",
    );
  }

  // Delete resume (cascades to versions due to foreign key constraint)
  await db.delete(resume).where(eq(resume.id, resumeId));
}

/**
 * Get resume versions
 */
export async function getResumeVersions(resumeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if user owns this resume
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
}

/**
 * Restore a resume version
 */
export async function restoreVersion(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const resumeId = formData.get("resumeId") as string;
  const versionId = formData.get("versionId") as string;

  // Check if user owns this resume
  const [existingResume] = await db
    .select()
    .from(resume)
    .where(and(eq(resume.id, resumeId), eq(resume.userId, session.user.id)));

  if (!existingResume) {
    throw new Error("Resume not found or you don't have permission");
  }

  // Get the version to restore
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

  // Update resume with version data
  await db
    .update(resume)
    .set({
      title: versionToRestore.title,
      markdown: versionToRestore.markdown,
      css: versionToRestore.css,
      content: versionToRestore.content,
      updatedAt: new Date(),
    })
    .where(eq(resume.id, resumeId));

  revalidatePath(`/resumes/${resumeId}`);
  return { success: true };
}
