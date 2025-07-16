// import { expect, test } from "@/tests/utils";
// import { programmaticLogin } from "@/tests/utils/auth";
// import crypto from "crypto";

// // A mock payload to send to the webhook. In a real scenario, this would be a valid
// // Stripe event object. For testing our endpoint's signature verification, the exact
// // contents are less important than the signing process itself.
// const MOCK_WEBHOOK_PAYLOAD = {
//   id: "evt_test_webhook_12345",
//   object: "event",
//   type: "checkout.session.completed",
//   data: {
//     object: {
//       id: "cs_test_12345",
//       object: "checkout.session",
//       customer: "cus_12345",
//       status: "complete",
//     },
//   },
// };

// /**
//  * Creates a fake Stripe signature header.
//  * This function mimics how Stripe creates a signature, allowing us to test our
//  * webhook's verification logic without needing a real webhook secret.
//  * @param timestamp - The timestamp of the event.
//  * @param payload - The JSON payload of the event.
//  * @param secret - A fake secret to sign the payload with.
//  * @returns A Stripe-compatible signature header string.
//  */
// function createFakeStripeSignature(
//   timestamp: number,
//   payload: string,
//   secret: string,
// ): string {
//   const signedPayload = `${timestamp}.${payload}`;
//   const hmac = crypto.createHmac("sha256", secret);
//   hmac.update(signedPayload, "utf8");
//   const signature = hmac.digest("hex");
//   return `t=${timestamp},v1=${signature}`;
// }

// test.describe("Stripe API Endpoints", () => {
//   // --- Checkout Endpoint Tests ---
//   test.describe("GET /api/stripe/checkout", () => {
//     test("should return 401 for unauthenticated requests", async ({ page }) => {
//       // No login call, so the request is unauthenticated
//       const response = await page.request.get("/api/stripe/checkout");
//       expect(response.status()).toBe(401);
//     });

//     // This test verifies that the server-side logic for creating a Stripe checkout
//     // session is working correctly for an authenticated user. It mocks the final
//     // step, as it cannot interact with the external Stripe service directly.
//     test("should create a checkout session for an authenticated user", async ({
//       page,
//       user,
//     }) => {
//       await programmaticLogin(page, user);

//       const response = await page.request.get("/api/stripe/checkout");

//       expect(response.ok()).toBe(true);
//       const json = await response.json();

//       expect(json).toHaveProperty("url");
//       expect(typeof json.url).toBe("string");
//       expect(json.url).toContain("https://checkout.stripe.com");

//       expect(json).toHaveProperty("sessionId");
//       expect(typeof json.sessionId).toBe("string");
//       // Stripe test session IDs start with `cs_test_`
//       expect(json.sessionId).toMatch(/^cs_test_/);
//     });
//   });

//   // --- Webhook Endpoint Tests ---
//   test.describe("POST /api/stripe/webhook", () => {
//     const WEBHOOK_URL = "/api/stripe/webhook";

//     test("should return 400 if the request body is missing", async ({
//       page,
//     }) => {
//       const timestamp = Math.floor(Date.now() / 1000);
//       const signature = createFakeStripeSignature(timestamp, "", "fake_secret");

//       const response = await page.request.post(WEBHOOK_URL, {
//         // Omitting the `data` property sends a request with an empty body.
//         headers: {
//           "stripe-signature": signature,
//         },
//       });

//       expect(response.status()).toBe(400);
//       const json = await response.json();
//       expect(json.error).toBe("No request body");
//     });

//     test("should return 400 if the stripe-signature header is missing", async ({
//       page,
//     }) => {
//       const response = await page.request.post(WEBHOOK_URL, {
//         data: JSON.stringify(MOCK_WEBHOOK_PAYLOAD),
//         headers: {
//           "Content-Type": "application/json",
//           // No "stripe-signature" header included
//         },
//       });

//       expect(response.status()).toBe(400);
//       const json = await response.json();
//       expect(json.error).toBe("Missing Stripe signature");
//     });

//     // Note: A test for a *valid* webhook is challenging in an E2E/integration environment
//     // because it requires exposing the actual `STRIPE_WEBHOOK_SECRET` to the test runner
//     // to generate a valid signature. This secret should not be exposed. Therefore, testing
//     // the failure cases (missing/invalid signature) is the most secure and practical approach.
//   });
// });
