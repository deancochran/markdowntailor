import { relations } from "drizzle-orm/relations";
import { user, account, aiRequestLog, authenticator, resume, resumeVersions, session } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	aiRequestLogs: many(aiRequestLog),
	authenticators: many(authenticator),
	resumes: many(resume),
	sessions: many(session),
}));

export const aiRequestLogRelations = relations(aiRequestLog, ({one}) => ({
	user: one(user, {
		fields: [aiRequestLog.userId],
		references: [user.id]
	}),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(user, {
		fields: [authenticator.userId],
		references: [user.id]
	}),
}));

export const resumeRelations = relations(resume, ({one, many}) => ({
	user: one(user, {
		fields: [resume.userId],
		references: [user.id]
	}),
	resumeVersions: many(resumeVersions),
}));

export const resumeVersionsRelations = relations(resumeVersions, ({one}) => ({
	resume: one(resume, {
		fields: [resumeVersions.resumeId],
		references: [resume.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));