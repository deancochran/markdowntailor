import { expect } from "@playwright/test";
import { authTest } from "../utils/auth";

// Helper function to create mock resume data
function createMockResume(userId: string) {
  return {
    id: `test-resume-${Date.now()}`,
    userId,
    title: "Test Resume",
    markdown: "# Performance Test Resume",
    css: "body { font-family: Arial; }",
    content: "Performance Test Resume",
  };
}

authTest.describe("AI Protection Performance Tests", () => {
  authTest(
    "database operations should be efficient",
    async ({ page, authenticatedUser }) => {
      const mockResume = createMockResume(authenticatedUser.id);
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          page.request.post("/api/chat", {
            data: {
              messages: [{ role: "user", content: `Performance test ${i}` }],
              resume: mockResume,
            },
          }),
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(30000); // 30 seconds for 10 requests

      // Most requests should succeed (some might be rate limited)
      const successfulRequests = responses.filter((r) => r.status() === 200);
      const rateLimitedRequests = responses.filter((r) => r.status() === 429);

      // At least some should succeed, unless all are rate limited
      expect(
        successfulRequests.length + rateLimitedRequests.length,
      ).toBeGreaterThan(0);
    },
  );
});
