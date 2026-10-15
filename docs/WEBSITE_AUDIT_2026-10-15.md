# Website Audit Report — www.famousengineering.pk

**Prepared for:** Famous Engineering Services (FES)
**Audit date:** 15 October 2026
**Scope:** Functionality, technical SEO, performance, security, content, UX/mobile, accessibility, lead-generation
**Method:** Live HTTP checks (headers, status codes, asset sizes), real-browser rendering of every page/view on desktop and 375 px mobile, form and widget interaction analysis, review of served HTML, JS bundle, robots.txt, sitemap.xml and JSON-LD.
**Limitations:** Not a full Lighthouse/PageSpeed run — please confirm Core Web Vitals on PageSpeed Insights (mobile). A real submission was **not** made to the live form (to avoid sending test data); the form behaviour was established by reading the shipped code. Colour-contrast and screen-reader testing were not performed.

---

## 1. Executive Summary

FES has a polished, modern site: a strong brand look, 25 real project showcases, a BLT authorisation certificate, three office addresses with map links, a WhatsApp/call CTA and a good mobile layout.

But the audit found **one critical functional defect and several structural SEO problems** that undermine the site's real purpose — being found on Google and turning visitors into enquiries:

1. 🔴 **The "Send enquiry" form does not send anything.** It clears itself and tells the visitor "Your message has been recorded", but no data leaves the browser. Every web-form enquiry is silently lost.
2. 🔴 **Site is a single-page app using `#hash` views** (`/#services`, `/#projects`…). Google ignores hash fragments, so Services, Industries, Projects, Partners, Why FES and Contact are **not separately indexable**. The sitemap lists `/services`, `/contact` etc., which are not real pages (they just serve the homepage shell).
3. 🔴 **Initial HTML is empty** (2.5 KB, `<div id="root">`) – crawlers, WhatsApp/Facebook/LinkedIn link previews and AI search see no content.
4. 🟠 **~1 MB logo + hero payload, 907 KB JS bundle, unoptimised project photos (some ~1 MB), no long-term caching.**
5. 🟠 **No security headers beyond HSTS**, soft-404 behaviour, and a few trust/credibility issues (reused photos, "AI Advisor" is a keyword bot).

**Overall rating: 6 / 10.** Design/content 8, Functionality 4 (form), SEO 3, Performance 5, Security 5, Mobile UX 8, Accessibility 6 (indicative).

| Area | Score | One-line verdict |
|---|---|---|
| Visual design & branding | 8/10 | Distinctive, professional, consistent |
| Content (sections, projects, trust) | 7/10 | Rich once loaded; some gaps (see §5) |
| Functionality / lead capture | 3/10 | Contact form is non-functional |
| Technical SEO | 3/10 | Hash-routing + CSR = near-invisible to search |
| Performance | 5/10 | Fast server, heavy payload |
| Security | 5/10 | HTTPS+HSTS good; missing hardening headers |
| Mobile UX | 8/10 | No overflow, hamburger menu, WhatsApp/AI FABs |
| Accessibility | 6/10 | Good basics, some gaps |

---

## 2. What Is Working Well

**Infrastructure & hygiene**
- HTTPS enforced, HSTS `max-age=63072000`; `http→https` and `non-www→www` via clean 308 redirects.
- Vercel CDN: TTFB ≈ 0.24 s; DOMContentLoaded ≈ 1.1 s on test connection.
- `robots.txt` and `sitemap.xml` exist and reference each other; `/api/` disallowed; favicon set + apple-touch-icon.
- Brotli compression active on JS.

**On-page basics**
- Good `<title>` (62 chars) and description (~170 chars, mentions Pakistan + core services).
- Canonical, robots meta, theme-color, Open Graph tags present.
- `lang="en"`, `<main>` landmark, exactly one `<h1>` ("Every floor, accounted for."), 0 images missing `alt`, form inputs all have labels, `prefers-reduced-motion` respected in CSS, no horizontal overflow on mobile.
- FAQPage JSON-LD with relevant Q&As (services, emergency breakdown, BLT partnership).

**Business content (rendered views)**
- *Home:* hero, two live counters, stats strip (300+ units under care, 75+ active client sites, 25+ technical specialists).
- *Services:* Maintenance & AMC, Supply & Installation, Modernization, Escalator Service (+ dedicated escalator block with "Why Choose FES").
- *Partners:* official BLT elevators authorised partner + multi-brand support, with certificate image.
- *Industries:* 9 sectors (hospitals, commercial, malls, hotels, residential, universities, airports, industrial, government) + "Your sector not listed?".
- *Our work:* 25 named projects (AFIC, MCB Center, NUST, Bahria Univ., Air Univ., INMOL, Giga City, Imtiaz, Pakistan Intl Hospital, etc.) with category, city and brand — excellent social proof.
- *Why FES:* safety-led execution, service visibility, fast response, FAQ.
- *Contact:* three offices (Rawalpindi, Islamabad, Lahore) with full addresses and Google Maps links, phone, WhatsApp.
- Click-to-call and pre-filled WhatsApp CTAs on every view; persistent floating WhatsApp and AI-advisor buttons.

---

## 3. Findings — Detailed

### 🔴 CRITICAL

**C1. Contact form silently discards every enquiry**
- Evidence: the submit handler in the shipped bundle is `preventDefault(); setSuccess(true); form.reset(); setTimeout(hide, 5500)`. There is no `fetch`, no `/api` call, no `mailto:`, no third-party form service anywhere in the 907 KB bundle (searched for fetch targets, formspree/emailjs/web3forms/webhook, `/api/`).
- Impact: A visitor fills name/phone/email/service/message, sees "Thank you. Your message has been recorded.", and the data is gone. FES never receives it, the customer waits for a reply that never comes. Every web enquiry since the form went live has been lost. This is the highest-value fix on the site (and a reputational risk).
- Fix (same day): wire the form to a real endpoint — e.g. a Vercel serverless function (`/api/enquiry`) that emails the sales inbox (Resend/SendGrid/SMTP) and/or appends to Google Sheet/CRM, with server-side validation, honeypot + rate limiting (or Cloudflare Turnstile), and only show "Thank you" after a successful 2xx response; show an error with WhatsApp/phone fallback otherwise. Add a test submission after deployment.

**C2. Hash-based navigation = pages Google cannot index**
- Evidence: nav items are `<button>` elements (not `<a href>`) and views change via the URL fragment (`/#services`, `/#partners`, `/#industries`, `/#projects`, `/#about`, `/#contact`). All views share the same `<title>`, description, canonical (`/`) and OG tags. Only 2 `<a>` links exist in the header (tel + WhatsApp).
- Sitemap lists `/services`, `/industries`, `/projects`, `/partners`, `/why-fes`, `/contact` — each returns HTTP 200 with the identical 2,581-byte shell, and nothing links to them. They are not the URLs the UI actually uses.
- Impact: Google sees effectively a single page with minimal text → no chance to rank for "elevator maintenance Lahore", "escalator service Islamabad", "BLT elevator Pakistan", etc. Users cannot bookmark/share a section reliably or use the back button predictably.
- Fix: real URL routing (React Router with `<Link>`/`<a href>`), one URL per section, per-route `<title>`, description, canonical, OG, plus sitemap entries that match real URLs.

**C3. Initial HTML contains no content (client-side rendering only)**
- Evidence: raw HTML body = `<div id="root"></div>`. All text appears only after the 907 KB JS runs.
- Impact: Googlebot's second-wave rendering delays/limits indexing; Bing, DuckDuckGo, social previews and most AI crawlers get nothing. WhatsApp link previews use the fallback title and a 512 px favicon as image.
- Fix: pre-render/SSG (e.g. `vite-react-ssg`, Astro, or Next.js) so each route ships complete HTML.

### 🟠 HIGH

**H1. Heavy and unoptimised media**
| Asset | Size | Issue |
|---|---|---|
| `FES_Logo_Clean_Prominent.png` | 565 KB | 2632×304 shown at 430×66 (and 38×38); used twice, loaded eagerly |
| Hero `fes-hero-elevator-panoramic.jpg` | 473 KB | No WebP/AVIF, no responsive `srcset` |
| `aashiana-shopping-centre.jpg` | 957 KB | Largest project image |
| `imtiaz-sargodha.jpg` / `sana-safinaz.jpg` / `imtiaz-barakahu.jpg` | 552 / 375 / 310 KB | vs 60–150 KB for the rest |
| BLT certificate JPG | 702 KB | Not lazy / not optimised |
| Project gallery total | ≈ 4.6 MB for 22 unique images | Lazy-loaded (good) but each image is heavy; displayed at 439×230 yet delivered at up to 1200 px |
- Zero WebP/AVIF references in the bundle. Hero/logo ≈ 1 MB before any content paints.
- Target: logo as SVG or ≤ 30 KB, hero ≤ 120 KB WebP/AVIF with `srcset`, project images ≤ 60 KB at 800 px, add `width/height` to prevent layout shift, `fetchpriority="high"` on the hero only.

**H2. JavaScript bundle is one 907 KB file (252 KB gzip)**
No route-level code splitting; all sections, 25-project dataset, the AI-advisor script and animations load up front. Split by view, lazy-load the AI advisor and the projects view, aim for ≤ 150 KB gzip initial JS.

**H3. No long-term caching on static assets**
`/assets/index-BSuIjXRP.js` (content-hashed) and images respond with `Cache-Control: public, max-age=0, must-revalidate`. Hashed assets should be `public, max-age=31536000, immutable`; images/fonts at least 30 days. Fix in `vercel.json` headers. Returning visitors currently revalidate every file.

**H4. Soft-404**
Any unknown URL (e.g. `/zzz-nonexistent`) returns HTTP 200 + homepage. Combine with routing/pre-render so unknown paths return a real 404 page.

**H5. Security headers missing**
Only `Strict-Transport-Security` is set. Add: `Content-Security-Policy` (allow self, Google Fonts, wa.me, maps), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), `frame-ancestors 'self'` (clickjacking). HTML also returns `Access-Control-Allow-Origin: *` — unnecessary for a public page; restrict unless intentionally needed.

### 🟡 MEDIUM

**M1. "AI Advisor / Ask FES Consultant" is a keyword bot, not AI.**
It matches words (`amc`, `install`, `lagwani`, `purani`, `vvvf`, …) to canned replies and WhatsApp CTAs, and "inquiries" are only `console.log`ged. It is a clever lead-router (supports Roman-Urdu keywords), but labelling it "AI" may overpromise; unmatched questions get generic replies. Either rename ("Quick Help"), or connect a real LLM backend with guardrails, and log chats/leads server-side.

**M2. Credibility issues in the project gallery**
- Four entries reuse another project's photo: *Ali Tower* uses Al-Hafeez Heights; *Rawal Mall and Residencia* uses Giga City; *MCB Z Block DHA* uses MCB Center; *Devine Centre* uses Liberty Tower. Sophisticated buyers will notice.
- Cards show "Arrival verified" and brand ("Hyundai Elevator" for several) without descriptions of scope (units, years, service type). Add scope, number of units, year and client type.

**M3. Counters begin at "0" and animate**
Headline stats ("Elevators & Escalators Serviced", "Customer Complaints Resolved" ≈ 25,505) are *estimated* from "average monthly and daily service volumes" (as the footnote admits), while the stats strip says "300+ units under care". These two sets of numbers can look inconsistent. Use verifiable metrics (units under care, sites, response time, years) and avoid the "complaints resolved" framing as a hero number.

**M4. Structured data is minimal**
Only `FAQPage`. Add `Organization`/`LocalBusiness` (3 locations with address, geo, phone, openingHours 24/7 emergency, areaServed, sameAs), `Service` items, `BreadcrumbList`, and `ImageObject` for projects.

**M5. OG/social image**
`og:image` is the 512×512 favicon. Use a 1200×630 branded image; add `og:image:alt`, `twitter:card`, `og:locale`.

**M6. Analytics / tracking not found**
No GA4, Google Tag, Meta Pixel or Clarity detected in the bundle. Without them there's no data on traffic, WhatsApp-click conversions or form usage. Add GA4 + event tracking for: call click, WhatsApp click, form success, AI-advisor CTA; verify Search Console + Google Business Profile for all 3 offices.

**M7. Form UX**
Phone field is `type="text"` (use `type="tel"`, pattern for PK numbers), no `autocomplete` attributes (name, tel, email), no consent/privacy line, no spam protection, no file attachment (drawings/site photos), no city/building-type fields that help sales qualify the lead.

### 🟢 LOW

- Email address is not shown anywhere on the site (only `you@company.com` placeholder) — B2B/tender buyers expect an email.
- No Privacy Policy / Terms / cookie notice (needed once analytics and form data collection exist).
- No skip-to-content link; 39 interactive targets are < 44×44 px on mobile (nav pills, project arrows) — raise touch targets.
- Two identical logo images rendered in header (one 0×0, mobile-menu duplicate) – load once.
- Sitemap lacks `<lastmod>`; `changefreq`/`priority` are ignored by Google.
- Google Fonts: three families (DM Sans, IBM Plex Mono, Manrope) loaded from a third party; self-host and subset to cut a request chain and remove third-party dependency.
- Only English; consider Urdu content/toggle for local reach.
- HTML comment "Unauthorized scraping prohibited" has no legal/technical effect.
- No blog/resources section, no downloadable company profile/brochure, no client testimonials/logos, no maintenance-plan pricing or SLA table.
- Colour contrast (gold-on-navy, small mono labels such as "ARRIVAL VERIFIED") and keyboard focus visibility should be tested against WCAG 2.1 AA; the elevator door-transition and counters need confirmed motion-safety and `aria-live` handling.

---

## 4. Content & Messaging Observations

- **Strength:** Clear positioning (precision, preventive maintenance, rapid response), BLT authorised partnership, multi-brand independent service, nationwide project list.
- **Gap – differentiators are asserted, not proven:** no response-time numbers (e.g. "2-hour response in Islamabad/Rawalpindi"), no SLA, no certifications/standards (e.g. safety standards, licensed technicians), no named clients' testimonials.
- **Gap – pricing path:** visitors can't tell how to start (AMC vs. one-off repair vs. new install). Add 3 simple "How it works" steps and a downloadable AMC proposal sample.
- **Gap – local SEO:** no pages for "Elevator maintenance Lahore / Islamabad / Rawalpindi / Karachi", though offices exist in three cities.
- **Gap – tender/consultant audience:** no company profile PDF, no list of authorised brands with certificates downloadable, no past-performance statement.

---

## 5. Recommended Improvement Roadmap

### Phase 0 — This week (stop the bleeding)
1. **Fix the contact form (C1)** — real delivery to email + WhatsApp/Sheet; confirm with a test. Until fixed, temporarily replace the form with a notice pointing to phone/WhatsApp.
2. Optimise the logo (SVG or ≤ 30 KB) and hero/project images (WebP/AVIF, correct sizes).
3. Add cache headers for `/assets/*`, `/media/*`, `/projects/*`, `/branding/*`.
4. Add security headers via `vercel.json`.
5. Replace the 4 duplicated project photos with real ones (or remove those cards).
6. Set up GA4 + Search Console + Google Business Profile (3 locations).

### Phase 1 — SEO architecture (1–2 weeks)
1. Real routes with `<a href>` navigation: `/`, `/services`, `/services/maintenance-amc`, `/services/installation`, `/services/modernization`, `/services/escalators`, `/industries`, `/projects`, `/partners`, `/why-fes`, `/contact`.
2. Pre-render/SSG every route; unique title, meta description, canonical, OG per page.
3. 404 page with true 404 status; update sitemap to the real URLs with `lastmod`; resubmit in Search Console.
4. Route-level code splitting; lazy-load AI advisor and projects.
5. Add `LocalBusiness` (×3), `Service`, `BreadcrumbList` schema; 1200×630 OG image.

### Phase 2 — Conversion & trust (2–4 weeks)
1. Upgrade the enquiry form (tel type, autocomplete, building type, city, # of lifts, optional attachment, spam protection, consent text, auto-reply email, CRM/lead log).
2. Display a business email and office hours; "24/7 breakdown" strip with direct call button.
3. Proof: client logos/testimonials (with permission), project detail pages (scope, units, year, photos), safety/standards badges, response-time commitment.
4. Downloadable company profile + AMC sample proposal (PDF) for consultants and tenders.
5. Decide the future of the "AI Advisor": rebrand as quick help or connect to a real LLM with lead logging.
6. Cookie/privacy policy page.

### Phase 3 — Growth (ongoing)
1. City landing pages (Lahore, Islamabad, Rawalpindi, Karachi, Peshawar…) with unique content.
2. Resource blog: service intervals, modernization vs replacement, VVVF/controller upgrades, escalator safety, hospital-lift requirements.
3. Reviews programme on Google Business Profile; local directory listings; backlinks from BLT/partner pages.
4. Monthly Lighthouse/Core Web Vitals review; quarterly WCAG 2.1 AA audit; Urdu content.

---

## 6. Priority Matrix

| # | Item | Impact | Effort | Priority |
|---|---|---|---|---|
| 1 | Make contact form actually send | Critical | Low | **P0** |
| 2 | Real routes + per-page meta (C2) | Very high | Medium | **P1** |
| 3 | Pre-render / SSG (C3) | Very high | Medium | **P1** |
| 4 | Compress logo/hero/project images | High | Low | **P1** |
| 5 | Cache headers + security headers | Medium–High | Low | **P1** |
| 6 | Analytics + Search Console + GBP | High | Low | **P1** |
| 7 | Replace duplicated project photos | Medium | Low | P2 |
| 8 | LocalBusiness schema, OG image | Medium–High | Low | P2 |
| 9 | Code splitting | Medium | Medium | P2 |
| 10 | Proof/testimonials, project detail pages | High | Medium | P2 |
| 11 | AI advisor decision | Medium | Low–High | P3 |
| 12 | City pages, blog, Urdu | High (long term) | High | P3 |

---

## 7. Raw Measurements

| Metric | Value |
|---|---|
| Raw HTML (every URL) | 2,581 B |
| Main JS | 906,834 B raw / ≈251,767 B gzip |
| Vendor JS | 20,331 B / 7,445 B gzip |
| CSS | 146,863 B / 27,630 B gzip |
| Logo PNG | 565 KB (2632×304) |
| Hero JPG | 473 KB |
| Project images | 22 unique, ≈ 3.8 MB (excl. logo), range 61–957 KB |
| BLT certificate | 702 KB |
| TTFB / DCL | ≈ 0.24 s / ≈ 1.15 s |
| `Cache-Control` on hashed JS & images | `max-age=0, must-revalidate` |
| Security headers | HSTS only |
| Unknown URL status | 200 (soft 404) |
| Structured data | FAQPage only |
| `<a href>` links in header | 2 (tel, WhatsApp); 7 nav items are buttons |
| Mobile (375 px) | No horizontal overflow; hamburger present; 39 touch targets < 44 px |
| Contact form | 5 fields + select, no network call on submit |
| Analytics tags | None detected |

*Not verified: Core Web Vitals field data, Search Console index status/rankings, backlinks, colour-contrast ratios, screen-reader behaviour, the real Vercel project configuration, email/DNS (SPF/DKIM/DMARC) setup.*
