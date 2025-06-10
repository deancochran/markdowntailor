import { db } from "@/db/drizzle";
import { aiRequestLog } from "@/db/schema";
import {
  checkAILimits,
  cleanInput,
  cleanMessages,
  getUserUsage,
  logAIRequest,
} from "@/lib/actions/ai";
import { expect } from "@playwright/test";
import { Message } from "ai";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import { authTest } from "../utils/auth";

authTest.describe("AI Actions Unit Tests", () => {
  authTest.beforeEach(async ({ authenticatedUser }) => {
    // Clean up any existing test data for this user
    await db
      .delete(aiRequestLog)
      .where(eq(aiRequestLog.userId, authenticatedUser.id));
  });

  authTest.afterEach(async ({ authenticatedUser }) => {
    // Clean up test data
    await db
      .delete(aiRequestLog)
      .where(eq(aiRequestLog.userId, authenticatedUser.id));
  });

  authTest(
    "checkAILimits - should allow requests for new user",
    async ({ authenticatedUser }) => {
      const result = await checkAILimits(authenticatedUser.id);

      expect(result.allowed).toBe(true);
      expect(result.usage?.userBalance).toBe(0);
    },
  );

  authTest(
    "checkAILimits - should block when cost limit exceeded",
    async ({ authenticatedUser }) => {
      // Add usage that exceeds limit
      await logAIRequest({
        userId: authenticatedUser.id,
        totalTokens: 30000000, // 30M tokens total
        promptTokens: 5000000, // 5M input tokens
        completionTokens: 25000000, // 25M output tokens
        status: "success",
        model: "gpt-4.1-nano",
        modelProvider: "openai",
      });

      const result = await checkAILimits(authenticatedUser.id);

      expect(result.allowed).toBe(false);
      expect(result.error).toContain("$5 usage limit reached");
    },
  );

  authTest(
    "logAIRequest - should log request correctly",
    async ({ authenticatedUser }) => {
      await logAIRequest({
        userId: authenticatedUser.id,
        totalTokens: 100000,
        promptTokens: 100000,
        completionTokens: 0,
        status: "success",
        model: "gpt-4.1-nano",
        modelProvider: "openai",
      });

      const logs = await db
        .select()
        .from(aiRequestLog)
        .where(eq(aiRequestLog.userId, authenticatedUser.id));
      expect(logs.length).toBe(1);
      expect(logs[0].totalTokens).toBe(100000);
      expect(logs[0].status).toBe("success");
      expect(parseFloat(logs[0].costEstimate)).toBeGreaterThan(0);
    },
  );

  authTest("cleanInput - should sanitize malicious content", async () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>Hello',
      'javascript:alert("xss")',
      "SELECT * FROM users WHERE id=1",
      '<?php echo "hack"; ?>',
    ];

    maliciousInputs.forEach((input) => {
      const cleaned = cleanInput(input);
      expect(cleaned).not.toContain("<script>");
      expect(cleaned).not.toContain("javascript:");
      expect(cleaned.length).toBeLessThanOrEqual(8000);
    });
  });

  authTest("cleanInput - should handle long content", async () => {
    const longInput = "a".repeat(10000);
    const cleaned = cleanInput(longInput);

    expect(cleaned.length).toBe(8000);
  });

  authTest("cleanMessages - should clean message content", async () => {
    const messages: Message[] = [
      {
        id: v4(),
        role: "user",
        content: '<script>alert("xss")</script>Help me',
      },
      { id: v4(), role: "assistant", content: "Normal response" },
      { id: v4(), role: "user", content: 'javascript:alert("hack")' },
    ];

    const cleaned = cleanMessages(messages);

    expect(cleaned.length).toBe(3);
    expect(cleaned[0].content).not.toContain("<script>");
    expect(cleaned[2].content).not.toContain("javascript:");
  });

  authTest(
    "getUserUsage - should calculate usage correctly",
    async ({ authenticatedUser }) => {
      // Add some test usage data
      await logAIRequest({
        userId: authenticatedUser.id,
        totalTokens: 100000,
        promptTokens: 100000,
        completionTokens: 0,
        status: "success",
        model: "gpt-4.1-nano",
        modelProvider: "openai",
      });

      await logAIRequest({
        userId: authenticatedUser.id,
        totalTokens: 100000,
        promptTokens: 100000,
        completionTokens: 0,
        status: "success",
        model: "gpt-4.1-nano",
        modelProvider: "openai",
      });

      const usage = await getUserUsage(authenticatedUser.id);

      expect(usage).not.toBeNull();
      expect(usage!.totalRequests).toBe(2);
      expect(usage!.totalTokens).toBe(200000);
      expect(usage!.totalCost).toBeGreaterThan(0);
      expect(usage!.remainingBudget).toBeLessThan(5.0);
      expect(usage!.usagePercentage).toBeGreaterThan(0);
    },
  );

  authTest(
    "rate limiting - should track requests in memory",
    async ({ authenticatedUser }) => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 12; i++) {
        promises.push(checkAILimits(authenticatedUser.id));
      }

      const results = await Promise.all(promises);

      // Some should be blocked due to rate limiting
      const allowed = results.filter((r) => r.allowed);
      const blocked = results.filter((r) => !r.allowed);

      expect(allowed.length).toBeLessThanOrEqual(10); // Max 10/minute
      expect(blocked.length).toBeGreaterThan(0);

      // Check error messages
      const rateLimitedErrors = blocked.filter((r) =>
        r.error?.includes("Too many requests per minute"),
      );
      expect(rateLimitedErrors.length).toBeGreaterThan(0);
    },
  );
});
