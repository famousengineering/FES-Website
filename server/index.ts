import express, { type Request, type Response } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { saveInquiry } from "./inquiries-store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_SOURCES = new Set(["contact_form", "ai_consultant"]);
const MAX_LENGTHS = { name: 200, phone: 32, email: 320, service: 64, message: 4000, buildingType: 64, city: 100 } as const;

// Minimal in-memory per-IP rate limit for the public lead-capture endpoint —
// no new dependency, just a defense-in-depth guard against basic form spam.
// Not a substitute for a real WAF/rate-limiter in front of production traffic.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security: hide Express signature and add defense-in-depth HTTP headers
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  app.use(express.json({ limit: "20kb" }));

  app.post("/api/inquiries", async (req: Request, res: Response) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    if (isRateLimited(ip)) {
      res.status(429).json({ ok: false, error: "Too many requests. Please try again in a minute, or contact us directly by phone or WhatsApp." });
      return;
    }

    const body = req.body ?? {};
    const { name, phone, email, service, message, buildingType, city, source } = body as Record<string, unknown>;

    if (!isNonEmptyString(name) || !isNonEmptyString(phone) || !isNonEmptyString(service)) {
      res.status(400).json({ ok: false, error: "Name, phone and service are required." });
      return;
    }
    if (!isNonEmptyString(source) || !VALID_SOURCES.has(source)) {
      res.status(400).json({ ok: false, error: "Invalid submission source." });
      return;
    }
    const tooLong =
      name.length > MAX_LENGTHS.name ||
      phone.length > MAX_LENGTHS.phone ||
      (typeof email === "string" && email.length > MAX_LENGTHS.email) ||
      service.length > MAX_LENGTHS.service ||
      (typeof message === "string" && message.length > MAX_LENGTHS.message) ||
      (typeof buildingType === "string" && buildingType.length > MAX_LENGTHS.buildingType) ||
      (typeof city === "string" && city.length > MAX_LENGTHS.city);
    if (tooLong) {
      res.status(400).json({ ok: false, error: "One or more fields exceed the maximum allowed length." });
      return;
    }

    try {
      const result = await saveInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: typeof email === "string" && email.trim() ? email.trim() : undefined,
        service: service.trim(),
        message: typeof message === "string" ? message.trim() : undefined,
        buildingType: typeof buildingType === "string" && buildingType.trim() ? buildingType.trim() : undefined,
        city: typeof city === "string" && city.trim() ? city.trim() : undefined,
        source: source as "contact_form" | "ai_consultant",
      });
      res.status(201).json({ ok: true, savedToDb: result.savedToDb });
    } catch (error) {
      console.error("[api/inquiries] Failed to persist submission:", error);
      res.status(500).json({ ok: false, error: "We couldn't save your request right now. Please call or WhatsApp us directly." });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
