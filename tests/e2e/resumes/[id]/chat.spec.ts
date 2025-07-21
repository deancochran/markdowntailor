// import { programmaticLogin } from "@/tests/utils/auth";
// import { expect, test } from "tests/utils";
// const minimalResume = {
//   markdown: "# John Doe\n\nSoftware Engineer with 5 years of experience.",
//   css: "body { font-family: sans-serif; }",
// };

// test("should return 402 when user has insufficient credits", async ({
//   page,
//   user,
// }) => {
//   await programmaticLogin(page, user);
//   const response = await page.request.post(`/api/chat`, {
//     data: {
//       resume: minimalResume,
//       messages: [{ role: "user", content: "Hi" }],
//     },
//   });

//   expect(response.status()).toBe(402);
// });
