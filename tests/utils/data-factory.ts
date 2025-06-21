import { resume, user } from "@/db/schema";
import {
  DEFAULT_RESUME_CSS,
  DEFAULT_RESUME_MARKDOWN,
} from "@/lib/utils/defaults";
import { v4 as uuidv4 } from "uuid";
import { ResumeData } from "./resume-helper";

export class DataFactory {
  static createResumePayload(
    overrides: typeof resume.$inferInsert,
  ): ResumeData {
    return {
      id: uuidv4(),
      markdown: DEFAULT_RESUME_MARKDOWN,
      css: DEFAULT_RESUME_CSS,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createUserData(overrides: typeof user.$inferInsert) {
    return {
      id: uuidv4(),
      name: "Default Test User",
      ...overrides,
    };
  }
}
