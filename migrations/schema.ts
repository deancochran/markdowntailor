import {
  boolean,
  foreignKey,
  integer,
  numeric,
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
    markdown: text()
      .default(
        `
  # Hello World

  Welcome to your resume!

  You can customize this template to fit your needs.

  ## Using Markdown

  In markdown, you can use headers, lists, bold, italics, and lots of formatting options.

  ### Headers

  Use # for headers.

  ### Lists

  Use * for unordered lists.

  ### Formatting

  Use ** for bold text and * for italic text.

  ### More

  Check out the [Markdown Guide](https://www.markdownguide.org/) for more information.

  ## Using HTML in Markdown

  You can also use HTML tags within markdown to add more complex formatting.

  ### Example

  <div>
    <h3>Custom Background</h3>
    <p>This is a paragraph with a custom background color.</p>
  </div>

  ## Styling HTML in Markdown

  You can style HTML elements using CSS within markdown.

  ### Example

  <div style="background-color: #f0f0f0; padding: 10px;">
    <h3>Styled Background</h3>
    <p>This is a paragraph with a styled background color.</p>
  </div>

  With MarkdownTailor, you can easily style your resume using inline HTML syles
  as seen above, or you can use css.

  #### Updated HTML

  <div class="custom-background custom-text">
    <h3>Styled Background</h3>
    <p>This is a paragraph with a styled background color.</p>
  </div>

  #### CSS for HTML

  .custom-background {
    background-color: #f0f0f0;
    padding: 10px;
  }

  .custom-text {
    color: #ff0000;
    font-weight: bold;
  }
  `,
      )
      .notNull(),
    css: text()
      .default(
        `
  body {
    margin: 0;
    padding: 20px;
    font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background: white;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  h4 {
    font-size: 14px;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  ul {
    padding-left: 20px;
  }

  /* More default styles... */
`,
      )
      .notNull(),
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
    markdown: text()
      .default(
        `
  # Hello World

  Welcome to your resume!

  You can customize this template to fit your needs.

  ## Using Markdown

  In markdown, you can use headers, lists, bold, italics, and lots of formatting options.

  ### Headers

  Use # for headers.

  ### Lists

  Use * for unordered lists.

  ### Formatting

  Use ** for bold text and * for italic text.

  ### More

  Check out the [Markdown Guide](https://www.markdownguide.org/) for more information.

  ## Using HTML in Markdown

  You can also use HTML tags within markdown to add more complex formatting.

  ### Example

  <div>
    <h3>Custom Background</h3>
    <p>This is a paragraph with a custom background color.</p>
  </div>

  ## Styling HTML in Markdown

  You can style HTML elements using CSS within markdown.

  ### Example

  <div style="background-color: #f0f0f0; padding: 10px;">
    <h3>Styled Background</h3>
    <p>This is a paragraph with a styled background color.</p>
  </div>

  With MarkdownTailor, you can easily style your resume using inline HTML syles
  as seen above, or you can use css.

  #### Updated HTML

  <div class="custom-background custom-text">
    <h3>Styled Background</h3>
    <p>This is a paragraph with a styled background color.</p>
  </div>

  #### CSS for HTML

  .custom-background {
    background-color: #f0f0f0;
    padding: 10px;
  }

  .custom-text {
    color: #ff0000;
    font-weight: bold;
  }
  `,
      )
      .notNull(),
    css: text()
      .default(
        `
  body {
    margin: 0;
    padding: 20px;
    font-family: \'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background: white;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  h4 {
    font-size: 14px;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  ul {
    padding-left: 20px;
  }

  /* More default styles... */
`,
      )
      .notNull(),
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
    modelPreference: text("model_preference").default("o4-mini").notNull(),
    providerPreference: text("provider_preference").default("openai").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    alphaCreditsRedeemed: boolean("alpha_credits_redeemed")
      .default(false)
      .notNull(),
    credits: numeric({ precision: 19, scale: 4 }).default("0.00"),
  },
  (table) => [
    unique("user_email_unique").on(table.email),
    unique("user_stripe_customer_id_unique").on(table.stripeCustomerId),
  ],
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    amount: numeric({ precision: 19, scale: 4 }).notNull(),
    model: text().notNull(),
    provider: text().notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    totalTokens: integer("total_tokens").notNull(),
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
      name: "credit_transactions_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);
