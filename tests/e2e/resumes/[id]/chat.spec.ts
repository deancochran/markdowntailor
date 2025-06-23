import { expect, test } from "tests/utils";
const minimalResume = {
  markdown: "# John Doe\n\nSoftware Engineer with 5 years of experience.",
  css: "body { font-family: sans-serif; }",
};

test("should return 402 when user has insufficient credits", async ({
  page,
}) => {
  // Set user credits to 0
  const response = await page.request.post(`/api/chat`, {
    data: {
      resume: minimalResume,
      messages: [{ role: "user", content: "Hi" }],
    },
  });

  expect(response.status()).toBe(402);
  const body = await response.text();
  expect(body).toBe("Insufficient credits");
});
test("should return 429 for too many requests", async ({ page }) => {
  // The rate limiter is configured to allow 10 requests per 10 seconds.
  // We'll send more than that to trigger it.
  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(
      page.request.post(`/api/chat`, {
        data: {
          resume: minimalResume,
          messages: [{ role: "user", content: `Hi ${i}` }],
        },
      }),
    );
  }
  const responses = await Promise.all(promises);
  const statuses = responses.map((r) => r.status());

  // Expect at least one response to be 429
  expect(statuses).toContain(429);
});
test("should return a successful streaming response for a valid request", async ({
  page,
}) => {
  const response = await page.request.post(`/api/chat`, {
    data: {
      resume: minimalResume,
      messages: [
        { role: "user", content: "Analyze my resume for improvements" },
      ],
    },
  });

  expect(response.status()).toBe(200);
  // Vercel AI SDK streams data as text/plain
  expect(response.headers()["content-type"]).toContain("text/plain");

  const body = await response.body();
  // Check for the Vercel AI SDK streaming format prefix `0:` which indicates a data chunk
  expect(body.toString()).toContain("0:");
});
