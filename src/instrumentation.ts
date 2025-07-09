export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only import on server
    const { run_migrations } = await import("./db/migrate");
    await run_migrations();
  }
}
