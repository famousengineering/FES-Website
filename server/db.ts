/**
 * Lazily-initialized Drizzle client over the MySQL-compatible database
 * referenced by DATABASE_URL (TiDB Cloud in this project's existing
 * .project-config.json).
 *
 * IMPORTANT: `drizzle-orm` and `mysql2` are listed in package.json but this
 * sandbox could not run `pnpm install` (registry.npmjs.org is blocked by
 * network egress policy here — see the final implementation report), so
 * this code has not been able to run end-to-end. It is loaded via dynamic
 * import specifically so that:
 *   1. A deployment that hasn't run `pnpm install` yet, or has no
 *      DATABASE_URL configured, still boots the server normally.
 *   2. Any connection failure at runtime is caught and logged rather than
 *      crashing the process — see inquiries-store.ts, which always also
 *      writes to a local JSONL fallback so a lead is never silently lost.
 */
let dbPromise: Promise<unknown | null> | null = null;

export function getDb(): Promise<unknown | null> {
  if (!dbPromise) {
    dbPromise = initDb();
  }
  return dbPromise;
}

async function initDb(): Promise<unknown | null> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[db] DATABASE_URL is not set — inquiries will be stored to the local JSONL fallback only.");
    return null;
  }
  try {
    const [{ drizzle }, mysql] = await Promise.all([import("drizzle-orm/mysql2"), import("mysql2/promise")]);
    const pool = mysql.createPool(url);
    return drizzle(pool, { mode: "default" });
  } catch (error) {
    console.error("[db] Failed to initialize the database client — falling back to the local JSONL store for inquiries.", error);
    return null;
  }
}
