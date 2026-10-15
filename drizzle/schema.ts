import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) returned from authentication callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lead-capture submissions from the public site: the "/contact" page form
 * and the scripted FES Virtual Assistant widget both write here (see
 * server/index.ts's POST /api/inquiries route). Nothing on the public site
 * reads this table back — there is no admin/auth UI wired up in this app to
 * safely gate a "view leads" screen, so retrieve submissions with a direct
 * database query (or via the JSONL fallback file — see server/inquiries-store.ts)
 * rather than through an API route.
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 320 }),
  /** Service slug from client/src/data/company.ts SERVICES, or "general" / "emergency". */
  service: varchar("service", { length: 64 }).notNull(),
  message: text("message"),
  /** Building type collected by the AI consultant widget (e.g. "hospital", "residential"). Null for the plain contact form. */
  buildingType: varchar("buildingType", { length: 64 }),
  city: varchar("city", { length: 100 }),
  /** Which UI produced this lead. */
  source: mysqlEnum("source", ["contact_form", "ai_consultant"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// TODO: Add your tables here