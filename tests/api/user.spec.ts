// import { expect, test } from "tests/utils";
// import { programmaticLogin } from "tests/utils/auth";
// test.describe("/api/user", () => {
//   test("should return 401 when not authenticated", async ({ page }) => {
//     const response = await page.request.get("/api/user");
//     expect(response.status()).toBe(401);
//   });

//   test("should return user data when authenticated", async ({ page, user }) => {
//     await programmaticLogin(page, user);

//     const response = await page.request.get("/api/user");
//     expect(response.status()).toBe(200);
//     const data = await response.json();
//     expect.soft(data.id).toEqual(user.id);
//   });
// });
