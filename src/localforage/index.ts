import { Template } from "@/lib/utils/templates";
import localForage from "localforage";

// Configure main localForage instance
localForage.config({
  driver: [localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE],
  name: "markdowntailor",
  storeName: "keyvaluepairs",
  description: "Markdown CSS Resume Tailor Database",
});

const dbName = "markdowntailor_database";

// Create resumes table
const resumesTable = localForage.createInstance({
  name: dbName,
  storeName: "resumes",
  description: "Stores resume documents with markdown, CSS, and styles",
});

// Create resume versions table
const resumeVersionsTable = localForage.createInstance({
  name: dbName,
  storeName: "resumeVersions",
  description: "Stores different versions of resumes for version control",
});

// Create AI credit logs table
const sessionTable = localForage.createInstance({
  name: dbName,
  storeName: "session",
  description: "Stores all session data for web user",
});

// Type definitions based on your schema
export interface Resume {
  id: string;
  title: string;
  markdown: string;
  css: string;
  styles: string; // JSON string of styles
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  title: string;
  markdown: string;
  css: string;
  styles: string; // JSON string of styles
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  title: string;
  markdown: string;
  css: string;
  styles: string; // JSON string of styles
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  ai_model_provider?: string;
  ai_model_name?: string;
  ai_model_token?: string;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}

// Helper functions for each table
export const db = {
  resumes: {
    async create(
      resume: Omit<Resume, "id" | "createdAt" | "updatedAt">,
    ): Promise<Resume> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newResume: Resume = {
        id,
        ...resume,
        createdAt: now,
        updatedAt: now,
      };
      await resumesTable.setItem(id, newResume);
      return newResume;
    },

    async findById(id: string): Promise<Resume | null> {
      return await resumesTable.getItem(id);
    },

    async findAll(): Promise<Resume[]> {
      const resumes: Resume[] = [];
      await resumesTable.iterate((value: Resume) => {
        resumes.push(value);
      });
      return resumes.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    },

    async update(
      id: string,
      updates: Partial<Omit<Resume, "id" | "createdAt">>,
    ): Promise<Resume | null> {
      const existing = await resumesTable.getItem<Resume>(id);
      if (!existing) return null;

      const updated: Resume = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };
      await resumesTable.setItem(id, updated);
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      try {
        await resumesTable.removeItem(id);
        // Also delete associated versions
        const versions = await db.resumeVersions.findByResumeId(id);
        for (const version of versions) {
          await db.resumeVersions.delete(version.id);
        }
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Updates a resume and creates a new version. Mimics `saveResume`.
     */
    async saveAndVersion(
      resumeId: string,
      values: Partial<Omit<Resume, "id" | "createdAt" | "updatedAt">>,
    ): Promise<Resume | null> {
      const updatedResume = await this.update(resumeId, values);
      if (!updatedResume) return null;

      const latestVersionNum =
        await db.resumeVersions.getLatestVersion(resumeId);
      const newVersion = latestVersionNum + 1;

      await db.resumeVersions.create({
        resumeId: updatedResume.id,
        version: newVersion,
        title: updatedResume.title,
        markdown: updatedResume.markdown,
        css: updatedResume.css,
        styles: updatedResume.styles,
      });

      return updatedResume;
    },

    /**
     * Restores a resume from a specific version. Mimics `restoreVersion`.
     */
    async restoreFromVersion(versionId: string): Promise<Resume | null> {
      const versionToRestore = await db.resumeVersions.findById(versionId);
      if (!versionToRestore) return null;

      const { resumeId, title, markdown, css, styles } = versionToRestore;

      // Update the main resume with the version's content
      const updatedResume = await this.update(resumeId, {
        title,
        markdown,
        css,
        styles,
      });

      // Create a new version to record the restoration
      if (updatedResume) {
        const latestVersionNum =
          await db.resumeVersions.getLatestVersion(resumeId);
        const newVersion = latestVersionNum + 1;

        await db.resumeVersions.create({
          resumeId,
          version: newVersion,
          title,
          markdown,
          css,
          styles,
        });
      }

      return updatedResume;
    },
    /**
     * Creates a new resume from a selected Resume. Mimics `restoreFromVersion`.
     */
    async createFromResume(resume: Partial<Resume>): Promise<Resume> {
      const newResumeData = {
        title: `${resume.title} (Copy)`,
        markdown: resume.markdown || "",
        css: resume.css || "",
        styles: JSON.stringify(resume.styles || {}),
      };
      return this.create(newResumeData);
    },

    /**
     * Creates a new resume from a template. Mimics `createResumeFromTemplate`.
     */
    async createFromTemplate(template: Template): Promise<Resume> {
      const newResumeData = {
        title: `${template.name} (Copy)`,
        markdown: template.markdown,
        css: template.css,
        styles: JSON.stringify(template.styles),
      };
      return this.create(newResumeData);
    },

    /**
     * Duplicates an existing resume. Mimics `createResumeFromVersion`.
     */
    async duplicate(resumeId: string): Promise<Resume | null> {
      const existingResume = await this.findById(resumeId);
      if (!existingResume) return null;

      const newResumeData = {
        title: `${existingResume.title} (Copy)`,
        markdown: existingResume.markdown,
        css: existingResume.css,
        styles: existingResume.styles,
      };

      return this.create(newResumeData);
    },
  },

  resumeVersions: {
    async create(
      version: Omit<ResumeVersion, "id" | "createdAt" | "updatedAt">,
    ): Promise<ResumeVersion> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newVersion: ResumeVersion = {
        id,
        ...version,
        createdAt: now,
        updatedAt: now,
      };
      await resumeVersionsTable.setItem(id, newVersion);
      return newVersion;
    },

    async findByResumeId(resumeId: string): Promise<ResumeVersion[]> {
      const versions: ResumeVersion[] = [];
      await resumeVersionsTable.iterate((value: ResumeVersion) => {
        if (value.resumeId === resumeId) {
          versions.push(value);
        }
      });
      return versions.sort((a, b) => b.version - a.version);
    },

    async findById(id: string): Promise<ResumeVersion | null> {
      return await resumeVersionsTable.getItem(id);
    },
    async findAllByResumeId(id: string): Promise<ResumeVersion[]> {
      const resumeVersions: ResumeVersion[] = [];
      await resumeVersionsTable.iterate((value: ResumeVersion) => {
        if (value.resumeId === id) {
          resumeVersions.push(value);
        }
      });
      return resumeVersions.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    },

    async getLatestVersion(resumeId: string): Promise<number> {
      const versions = await this.findByResumeId(resumeId);
      return versions.length > 0
        ? Math.max(...versions.map((v) => v.version))
        : 0;
    },

    async delete(id: string): Promise<boolean> {
      try {
        await resumeVersionsTable.removeItem(id);
        return true;
      } catch {
        return false;
      }
    },
  },
  sessions: {
    async create(): Promise<string> {
      const id = crypto.randomUUID();
      const now = new Date();
      const session: Session = {
        id,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day
        updatedAt: now,
      };

      await sessionTable.setItem(id, session);
      return id;
    },

    async findById(id: string): Promise<Session | null> {
      return await sessionTable.getItem(id);
    },

    async delete(id: string): Promise<boolean> {
      try {
        await sessionTable.removeItem(id);
        return true;
      } catch {
        return false;
      }
    },
  },
};

// Export table instances for direct access if needed
export { resumesTable, resumeVersionsTable, sessionTable };
function uuidv4() {
  throw new Error("Function not implemented.");
}
