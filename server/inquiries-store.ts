/**
 * Lead-capture persistence for the /contact form and the AI consultant
 * widget. Always writes to a local JSONL file (zero external dependencies,
 * can never fail to configure) and additionally writes to the real database
 * when one is configured and reachable — see db.ts.
 *
 * There is no admin/auth UI wired up anywhere in this app, so this
 * deliberately does NOT expose a GET/list API route: that would be an
 * unauthenticated public read of customer contact details. Retrieve
 * submitted leads with a direct database query, or by downloading
 * server/data/inquiries.jsonl from the server.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.jsonl");

export interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
  buildingType?: string;
  city?: string;
  source: "contact_form" | "ai_consultant";
}

function appendToFile(record: InquiryInput & { createdAt: string }) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(DATA_FILE, `${JSON.stringify(record)}\n`, "utf-8");
}

export async function saveInquiry(input: InquiryInput): Promise<{ savedToDb: boolean }> {
  const record = { ...input, createdAt: new Date().toISOString() };
  let savedToDb = false;

  try {
    const db = await getDb();
    if (db) {
      const { inquiries } = await import("../drizzle/schema");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).insert(inquiries).values({
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        service: input.service,
        message: input.message ?? null,
        buildingType: input.buildingType ?? null,
        city: input.city ?? null,
        source: input.source,
      });
      savedToDb = true;
    }
  } catch (error) {
    console.error("[inquiries] Database insert failed — the submission is still recorded in the local JSONL fallback.", error);
  }

  try {
    appendToFile(record);
  } catch (error) {
    console.error("[inquiries] Failed to write the local JSONL fallback file.", error);
    if (!savedToDb) throw error; // Only propagate if BOTH persistence paths failed.
  }

  return { savedToDb };
}
