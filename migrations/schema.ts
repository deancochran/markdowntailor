import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const verificationToken = pgTable("verificationToken", {
  identifier: text().notNull(),
  token: text().notNull(),
  expires: timestamp({ mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const account = pgTable(
  "account",
  {
    userId: text().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text(),
    idToken: text("id_token"),
    sessionState: text("session_state"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const authenticator = pgTable(
  "authenticator",
  {
    credentialId: text().notNull(),
    userId: text().notNull(),
    providerAccountId: text().notNull(),
    credentialPublicKey: text().notNull(),
    counter: integer().notNull(),
    credentialDeviceType: text().notNull(),
    credentialBackedUp: boolean().notNull(),
    transports: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "authenticator_userId_user_id_fk",
    }).onDelete("cascade"),
    unique("authenticator_credentialID_unique").on(table.credentialId),
  ],
);

export const resume = pgTable(
  "resume",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    title: text().notNull(),
    markdown: text().default("").notNull(),
    css: text().default("").notNull(),
    content: text().default("").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "resume_userId_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const resumeVersions = pgTable(
  "resume_versions",
  {
    id: text().primaryKey().notNull(),
    resumeId: text("resume_id").notNull(),
    version: integer().notNull(),
    title: text().notNull(),
    markdown: text().default("").notNull(),
    css: text().default("").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.resumeId],
      foreignColumns: [resume.id],
      name: "resume_versions_resume_id_resume_id_fk",
    }).onDelete("cascade"),
  ],
);

export const session = pgTable(
  "session",
  {
    sessionToken: text().primaryKey().notNull(),
    userId: text().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const aiRequestLog = pgTable(
  "ai_request_log",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    promptTokens: integer("prompt_tokens").notNull(),
    completionTokens: integer("completion_tokens").notNull(),
    model: text().notNull(),
    modelProvider: text("model_provider").notNull(),
    status: text().default("success").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ai_request_log_user_id_user_id_fk",
    }).onDelete("set null"),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().default("ResumeBuilder").notNull(),
    email: text().notNull(),
    emailVerified: timestamp({ mode: "string" }),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    modelPreference: text("model_preference").default("gpt-4.1").notNull(),
    providerPreference: text("provider_preference").default("openai").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    alphaCreditsRedeemed: boolean("alpha_credits_redeemed")
      .default(false)
      .notNull(),
  },
  (table) => [
    unique("user_email_unique").on(table.email),
    unique("user_stripe_customer_id_unique").on(table.stripeCustomerId),
  ],
);
