/**
 * Build-time prerender (run after `vite build`).
 *
 * The site is a client-rendered React app, so the raw HTML crawlers, link-preview bots
 * (WhatsApp, Facebook, LinkedIn) and AI crawlers receive is an empty <div id="root">.
 * This script turns the single Vite-generated index.html into one real HTML file per route:
 *
 *   dist/public/index.html            /
 *   dist/public/services/index.html   /services   (… one per route in PAGE_PATHS)
 *   dist/public/404.html              any unknown URL (served by the host with HTTP 404)
 *   dist/public/sitemap.xml           real URLs, with <lastmod>
 *
 * Each file gets a unique <title>, description, canonical and Open Graph tags, plus a plain-HTML
 * snapshot of that page's content (headings, copy, real <a href> links) inside #root. React replaces
 * the snapshot when it mounts, so users see no difference; crawlers get content immediately.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PAGE_PATHS, PAGE_SEO, SITE_URL, type Page } from "../client/src/lib/seo";
import { PROJECTS } from "../client/src/data/projects";
import { FAQS } from "../client/src/data/faqs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist", "public");
const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");

const OG_IMAGE = `${SITE_URL}/branding/FES_OG_1200x630.jpg`;
const PHONE_DISPLAY = "0304 4943377";

const NAV: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Services", page: "services" },
  { label: "Partners", page: "partners" },
  { label: "Industries", page: "industries" },
  { label: "Our work", page: "projects" },
  { label: "Why FES", page: "about" },
  { label: "Contact", page: "contact" },
];

const OFFICES = [
  "Office #226, 2nd Floor, Rawal Mall and Residencia, Main Murree Road, Rawalpindi",
  "Office #06, First Floor, Al Kashif Plaza, G-10 Markaz, Islamabad",
  "Office No. M1-89, Aashiana Center, Main Boulevard, near Liberty Chowk, Lahore",
];

// Plain-text mirrors of copy that lives inside React components (kept short; update with the components).
const SERVICES = [
  ["Maintenance & AMC", "Monthly preventive visits (or tailored to client demand), precision digital logs, and prompt breakdown support."],
  ["Supply & Installation", "Building-specific passenger, hospital and freight systems delivered with discipline."],
  ["Modernization", "Controllers, drives, doors and cabin upgrades that renew reliability without disruption."],
  ["Escalator Service", "Specialist care for high-traffic escalators, travelators and moving walkways."],
];
const INDUSTRIES = [
  "Hospitals & Medical",
  "Commercial & Corporate",
  "Shopping Malls & Retail",
  "Hotels & Hospitality",
  "Residential & Multi-Story",
  "Universities & Institutions",
  "Airports & Transportation",
  "Industrial & Warehouses",
  "Government & Public",
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const urlFor = (page: Page) => (PAGE_PATHS[page] === "/" ? `${SITE_URL}/` : `${SITE_URL}${PAGE_PATHS[page]}`);

function setTag(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) throw new Error(`prerender: template is missing ${pattern}`);
  return html.replace(pattern, replacement);
}

function snapshot(page: Page | "notfound"): string {
  const nav = `<nav aria-label="Main navigation">${NAV.map((n) => `<a href="${PAGE_PATHS[n.page]}">${esc(n.label)}</a>`).join(" | ")}</nav>`;
  const footer =
    `<footer><p>Famous Engineering Services (FES) — elevator and escalator installation, maintenance, modernization and emergency response across Pakistan.</p>` +
    `<p>Call <a href="tel:+923044943377">${PHONE_DISPLAY}</a> · <a href="https://wa.me/923044943377">WhatsApp</a></p>` +
    `<ul>${OFFICES.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></footer>`;

  let body = "";
  if (page === "notfound") {
    body = `<h1>Page not found</h1><p>The page you requested could not be found. <a href="/">Go to the FES home page</a>.</p>`;
  } else {
    const seo = PAGE_SEO[page];
    body = `<h1>${esc(seo.heading)}</h1><p>${esc(seo.intro)}</p>`;
    if (page === "home") {
      body +=
        `<p>Since 2010 · 300+ units under care · 75+ active client sites · 25+ technical specialists.</p>` +
        `<h2>What we do</h2><ul>${SERVICES.map(([t, d]) => `<li><b>${esc(t)}</b> — ${esc(d)}</li>`).join("")}</ul>` +
        `<p><a href="/contact">Plan your site assessment</a> · <a href="/services">Explore our services</a></p>`;
    }
    if (page === "services" || page === "escalators") {
      body += `<ul>${SERVICES.map(([t, d]) => `<li><b>${esc(t)}</b> — ${esc(d)}</li>`).join("")}</ul>`;
    }
    if (page === "partners") {
      body +=
        `<h2>BLT Brand Elevators</h2><p>FES is an officially authorized partner in Pakistan for BLT Brand Elevators for equipment supply, certified installation, tenders and factory warranty.</p>` +
        `<h2>Independent Service, Genuine Parts, Repair &amp; Modernization</h2><p>For other major manufacturers, FES provides independent preventive maintenance (AMC), 24/7 emergency repairs, authentic spare parts and modernization retrofits.</p>`;
    }
    if (page === "industries") {
      body += `<ul>${INDUSTRIES.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    }
    if (page === "projects") {
      body += `<ul>${PROJECTS.map((p) => `<li>${esc(p.title)} — ${esc(p.location)} (${esc(p.category)})</li>`).join("")}</ul>`;
    }
    if (page === "about") {
      body +=
        `<ul><li><b>Safety-led execution</b></li><li><b>Service visibility</b></li><li><b>Faster fault response</b></li></ul>` +
        `<h2>Frequently Asked Questions</h2>` +
        FAQS.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join("");
    }
    if (page === "contact") {
      body +=
        `<p>Call <a href="tel:+923044943377">${PHONE_DISPLAY}</a> or <a href="https://wa.me/923044943377">message us on WhatsApp</a>.</p>` +
        `<ul>${OFFICES.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`;
    }
  }

  // Colours match the site's dark theme so the pre-hydration flash is not jarring.
  return (
    `<div id="seo-snapshot" style="background:#081c2b;color:#e6eef1;min-height:100vh;padding:24px;font-family:'DM Sans',Arial,sans-serif;line-height:1.55">` +
    `<style>#seo-snapshot a{color:#e8a63a}#seo-snapshot h1{font-size:2rem;margin:.6em 0 .3em}#seo-snapshot nav a{margin:0 6px}</style>` +
    `${nav}<main>${body}</main>${footer}</div>`
  );
}

function render(page: Page | "notfound"): string {
  let html = template;
  const seo = page === "notfound" ? null : PAGE_SEO[page];
  const title = seo ? seo.title : "Page not found | Famous Engineering Services";
  const description = seo ? seo.description : "The page you requested could not be found.";
  const url = page === "notfound" ? null : urlFor(page);

  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${OG_IMAGE}" />`);
  if (url) {
    html = setTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
    html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
  } else {
    html = html.replace(/<link rel="canonical"[^>]*>\s*/, "");
    html = html.replace(/<meta property="og:url"[^>]*>\s*/, "");
    html = setTag(html, /<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="noindex, follow" />`);
  }

  const extraHead: string[] = [];
  if (page === "home") {
    extraHead.push(`<link rel="preload" as="image" href="/media/fes-hero-elevator-panoramic.webp" type="image/webp" fetchpriority="high" />`);
  }
  if (page === "about") {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    };
    extraHead.push(`<script type="application/ld+json" id="faq-jsonld">${JSON.stringify(faq).replace(/</g, "\\u003c")}</script>`);
  }
  if (page !== "notfound" && page !== "home") {
    const crumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: NAV.find((n) => n.page === page)?.label ?? PAGE_SEO[page].heading, item: urlFor(page) },
      ],
    };
    extraHead.push(`<script type="application/ld+json">${JSON.stringify(crumbs)}</script>`);
  }
  if (extraHead.length) html = html.replace("</head>", `    ${extraHead.join("\n    ")}\n  </head>`);

  html = setTag(html, /<div id="root"><\/div>/, `<div id="root">${snapshot(page)}</div>`);
  return html;
}

function write(rel: string, content: string) {
  const file = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  console.log(`prerender: wrote ${rel} (${Math.round(content.length / 1024)} KB)`);
}

for (const page of Object.keys(PAGE_PATHS) as Page[]) {
  const p = PAGE_PATHS[page];
  write(p === "/" ? "index.html" : `${p.slice(1)}/index.html`, render(page));
}
write("404.html", render("notfound"));

const today = new Date().toISOString().slice(0, 10);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    (Object.keys(PAGE_PATHS) as Page[])
      .map((p) => `  <url>\n    <loc>${urlFor(p)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
      .join("\n") +
    `\n</urlset>\n`,
);
