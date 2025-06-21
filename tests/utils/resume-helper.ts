import { APIRequestContext } from "@playwright/test";
import { User } from "next-auth";

// Define a type for your resume data for consistency
export interface ResumeData {
  markdown: string;
  css: string;
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
}

export class ResumeHelper {
  private request: APIRequestContext;
  private user: User;

  constructor(request: APIRequestContext, user: User) {
    this.request = request;
    this.user = user;
  }

  /**
   * Creates a resume via an API call for faster test setup.
   * Assumes you have a POST endpoint like /api/resumes
   * @returns The ID of the created resume.
   */
  async createResume(resumeData: ResumeData): Promise<ResumeData> {
    const response = await this.request.post("/api/resumes", {
      data: {
        ...resumeData,
        userId: this.user.id,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create resume via API: ${await response.text()}`,
      );
    }

    const result = await response.json();
    return result.id; // Assuming the API returns the created resume with its ID
  }

  /**
   * Deletes a resume via an API call for faster test cleanup.
   * Assumes you have a DELETE endpoint like /api/resumes/:id
   */
  async deleteResume(resumeId: string): Promise<void> {
    const response = await this.request.delete(`/api/resumes/${resumeId}`);
    if (!response.ok()) {
      // It's often fine if the resource is already gone, so we don't throw an error here.
      console.warn(`Failed to delete resume ${resumeId} during cleanup.`);
    }
  }

  async getResume(resumeId: string): Promise<ResumeData> {
    const response = await this.request.get(`/api/resumes/${resumeId}`);
    if (!response.ok()) {
      // It's often fine if the resource is already gone, so we don't throw an error here.
      console.warn(`Failed to delete resume ${resumeId} during cleanup.`);
    }
    const result = await response.json();
    return result;
  }
}
