// import { expect, test } from "tests/utils";
// // A minimal resume object to send with chat requests
// const minimalResume = {
//   markdown: "# John Doe\n\nSoftware Engineer with 5 years of experience.",
//   css: "body { font-family: sans-serif; }",
// };

// test.describe("/api/chat", () => {
//   test("should return 401 when not authenticated", async ({ page }) => {
//     // Log out to test unauthenticated access
//     const response = await page.request.post(`/api/chat`, {
//       data: {
//         resume: minimalResume,
//         messages: [{ role: "user", content: "Hi" }],
//       },
//     });
//     expect(response.status()).toBe(401);
//   });
// });
