# Website audit fixes — 15 Oct 2026

Based on the audit of https://www.famousengineering.pk (see the full audit report for evidence and scoring).

## ⚠️ Action required before this goes live: enquiry email

The contact form now posts to `POST /api/inquiries` (`api/inquiries.ts`, a Vercel serverless function) which emails the FES team through [Resend](https://resend.com). Add these in **Vercel → Project → Settings → Environment Variables** (Production + Preview), then redeploy:

| Variable | Required | Example |
|---|---|---|
| `RESEND_API_KEY` | yes | `re_xxx…` (Resend dashboard → API Keys) |
| `INQUIRY_TO_EMAIL` | yes | `info@famousengineering.pk` (comma-separate for several) |
| `INQUIRY_FROM_EMAIL` | optional | `FES Website <enquiries@famousengineering.pk>` — needs the domain verified in Resend. Default is Resend's shared `onboarding@resend.dev` sender, which can only deliver to the Resend account owner's own email until a domain is verified. |

Until these are set the form **does not pretend to succeed**: the API answers 503 and the visitor sees an error with a ready-made "Send it on WhatsApp instead" link containing their details. No enquiry is silently lost any more.

After deploying, submit one real test enquiry and confirm the email arrives.

## What changed

**Contact form (critical)** — previously only reset itself and showed "message recorded" (nothing was sent). Now: real POST, honest success/error states, WhatsApp fallback, honeypot spam trap, same-origin check, validation and per-IP rate limit on the server, `tel`/autocomplete attributes, optional city + building-type fields.

**Real URLs instead of `#hash` views** — `/services`, `/partners`, `/industries`, `/projects`, `/why-fes`, `/escalators`, `/contact`. Navigation items are real `<a href>` links (keeps the lift-door transition on normal clicks; middle-click / open-in-new-tab work). Old `/#services`-style links redirect to the new URLs. Back/forward buttons work.

**Prerender (`scripts/prerender.ts`, runs in `npm run build`)** — writes one HTML file per route with its own `<title>`, description, canonical and Open Graph tags plus a plain-HTML content snapshot (headings, copy, links) that React replaces on load. Also generates `404.html` (served with a real HTTP 404, `noindex`), `sitemap.xml` with the real URLs and `lastmod`, FAQPage JSON-LD on `/why-fes`, BreadcrumbList on inner pages, and a hero image preload on the home page. This is a lightweight static snapshot, not full server-side rendering. The text in the snapshot is mirrored from the React components (see the comments in the script) — if page copy changes, update the snapshot data too.

**Structured data / social** — Organization + 3 branch LocalBusiness entries (Rawalpindi, Islamabad, Lahore) in `client/index.html`; new 1200×630 social preview image (`branding/FES_OG_1200x630.jpg`) and `twitter:card` tags.

**Performance**
- First-load JS 907 KB → 353 KB (gzip ≈ 252 KB → ≈ 109 KB): the three.js lift (543 KB) and AI widget are now lazy-loaded chunks.
- Images ≈ 7 MB → ≈ 1.4 MB: all project/hero/media photos converted to WebP (some `.jpg`/`.png` files were actually mislabeled formats); logo 565 KB → 26 KB; BLT certificate 686 KB → 218 KB.
- `vercel.json`: `immutable` 1-year cache for hashed `/assets/*`, 30-day cache for images.

**Security headers (`vercel.json`)** — `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`. (`client/public/.htaccess` never applied on Vercel; headers now actually ship.) CSP was tested locally against the built site with no violations; if a new third-party script/font/image host is added later, extend the CSP.

**Other** — skip-to-content link, header logo width/height set, `<main id>` landmark, `aria-current` on active nav link, `aria-live` on form status.

## Not changed (needs a business decision or content from FES)

- **Duplicated project photos** — *Ali Tower*, *Rawal Mall and Residencia*, *MCB Z Block DHA* and *Devine Centre* still reuse other projects' photos. Supply real photos for `client/public/projects/` and update `client/src/data/projects.ts`.
- **"AI Advisor"** is a keyword-matching bot with canned answers, and chat messages are not stored or sent anywhere. Decide whether to relabel it or connect a real backend.
- **Headline counters** ("complaints resolved", ≈ 22–25k) are estimates derived from average service volumes; confirm they are claims FES is comfortable defending.
- **Analytics** — no GA4/Search Console snippet present. Provide the measurement ID to add it (and extend the CSP).
- **Business email, privacy policy, testimonials/client logos, company-profile PDF, city landing pages, Urdu content** — see the audit's Phase 2–3 roadmap.
- Dead code: `server/` (Express + MySQL/JSONL) and `drizzle/` are not used by the Vercel deployment; the Express `/api/inquiries` has the same contract as `api/inquiries.ts` if self-hosting is ever needed.
