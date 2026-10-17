/**
 * Vercel serverless function: POST /api/inquiries
 *
 * Receives enquiries from the contact form and the AI consultant widget and
 * emails them to the FES team through Gmail SMTP (nodemailer). Same request
 * contract as server/index.ts so the self-hosted Express server and this
 * function are interchangeable.
 *
 * Required environment variables (Vercel → Project → Settings → Environment Variables):
 *   GMAIL_USER          Gmail address that sends the mail, e.g. "famousengineering.pk@gmail.com"
 *   GMAIL_APP_PASSWORD  16-character Google "App password" for that account (NOT the normal
 *                       Gmail password; needs 2-Step Verification turned on)
 * Optional:
 *   INQUIRY_TO_EMAIL    Recipient(s), comma-separated. Defaults to GMAIL_USER.
 *
 * When delivery is not configured or fails, the function answers 503 so the
 * browser never shows a false "message recorded" and falls back to WhatsApp.
 */
import nodemailer from "nodemailer";

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

const VALID_SOURCES = new Set(["contact_form", "ai_consultant"]);
const MAX = { name: 200, phone: 32, email: 320, service: 64, message: 4000, buildingType: 64, city: 100 } as const;

// Best-effort per-instance rate limit (serverless instances are not shared).
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const header = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  // Same-origin only: reject cross-site browser posts.
  const origin = header(req.headers.origin);
  const host = header(req.headers["x-forwarded-host"]) || header(req.headers.host);
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      /* invalid origin */
    }
    if (originHost !== host) return res.status(403).json({ ok: false, error: "Forbidden." });
  }

  const ip = header(req.headers["x-forwarded-for"]).split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  if (limited(ip)) {
    return res.status(429).json({
      ok: false,
      error: "Too many requests. Please try again in a minute, or contact us directly by phone or WhatsApp.",
    });
  }

  let body: Record<string, unknown> = {};
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid request." });
    }
  } else if (req.body && typeof req.body === "object") {
    body = req.body as Record<string, unknown>;
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
  if (str(body.website)) return res.status(201).json({ ok: true });

  const name = str(body.name);
  const phone = str(body.phone);
  const service = str(body.service);
  const email = str(body.email);
  const message = str(body.message);
  const buildingType = str(body.buildingType);
  const city = str(body.city);
  const source = str(body.source);

  if (!name || !phone || !service) {
    return res.status(400).json({ ok: false, error: "Name, phone and service are required." });
  }
  if (!source || !VALID_SOURCES.has(source)) {
    return res.status(400).json({ ok: false, error: "Invalid submission source." });
  }
  if (
    name.length > MAX.name ||
    phone.length > MAX.phone ||
    service.length > MAX.service ||
    (email && email.length > MAX.email) ||
    (message && message.length > MAX.message) ||
    (buildingType && buildingType.length > MAX.buildingType) ||
    (city && city.length > MAX.city)
  ) {
    return res.status(400).json({ ok: false, error: "One or more fields exceed the maximum allowed length." });
  }
  if (!/^[0-9+()\-.\s]{7,32}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid phone number." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  // Google shows app passwords as "abcd efgh ijkl mnop"; the spaces are not part of the password.
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  const to = (process.env.INQUIRY_TO_EMAIL || gmailUser || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (!gmailUser || !gmailPass || to.length === 0) {
    console.error("[api/inquiries] GMAIL_USER / GMAIL_APP_PASSWORD not configured — enquiry NOT delivered.");
    return res.status(503).json({
      ok: false,
      error: "We couldn't send your request online right now. Please call or WhatsApp us directly.",
    });
  }

  const rows: [string, string | undefined][] = [
    ["Name", name],
    ["Phone", phone],
    ["Email", email],
    ["Service", service],
    ["Building type", buildingType],
    ["City", city],
    ["Message", message],
    ["Source", source === "ai_consultant" ? "AI consultant widget" : "Contact form"],
  ];
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  const html =
    `<h2>New website enquiry</h2><table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif">` +
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v as string).replace(/\n/g, "<br>")}</td></tr>`)
      .join("") +
    `</table>`;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transporter.sendMail({
      from: `"FES Website" <${gmailUser}>`,
      to,
      replyTo: email,
      subject: `New enquiry: ${service} — ${name}`.replace(/[\r\n]+/g, " "),
      text,
      html,
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("[api/inquiries] Email delivery failed:", error);
    return res.status(503).json({
      ok: false,
      error: "We couldn't send your request online right now. Please call or WhatsApp us directly.",
    });
  }
}
