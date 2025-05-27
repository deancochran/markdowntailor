import { relations } from "drizzle-orm/relations";
import { user, session, resume, resumeVersions, account, authenticator } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	authenticators: many(authenticator),
	resumes: many(resume),
}));

export const resumeVersionsRelations = relations(resumeVersions, ({one}) => ({
	resume: one(resume, {
		fields: [resumeVersions.resumeId],
		references: [resume.id]
	}),
}));

export const resumeRelations = relations(resume, ({one, many}) => ({
	resumeVersions: many(resumeVersions),
	user: one(user, {
		fields: [resume.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(user, {
		fields: [authenticator.userId],
		references: [user.id]
	}),
}));