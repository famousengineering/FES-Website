import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit configuration for the MySQL-compatible database referenced by
 * DATABASE_URL (TiDB Cloud in this project). Run `pnpm db:push` after
 * `pnpm install` and after DATABASE_URL is set in the environment to create
 * or update the `users` and `inquiries` tables defined in drizzle/schema.ts.
 *
 * This file was missing from the original handoff even though drizzle/schema.ts
 * already existed — see the final implementation report for the full context
 * on why the database path was previously unwired.
 */
if (!process.env.DATABASE_URL) {
  // Do not throw here: this file is also read by `tsc`/editors with no
  // DATABASE_URL present. Only `drizzle-kit push`/`generate` actually need a
  // real connection string, and drizzle-kit itself will report a clear error
  // if one is missing when those commands run.
  console.warn("[drizzle.config] DATABASE_URL is not set. `pnpm db:push` will fail until it is configured.");
}

export default defineConfig({
  dialect: "mysql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
