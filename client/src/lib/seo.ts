/**
 * Route + SEO metadata. Pure data (no React/DOM imports) so it is shared by the
 * running app (client-side title/meta updates) and the build-time prerender
 * script (scripts/prerender.ts) that writes one HTML file per route.
 */
export type Page = "home" | "about" | "services" | "projects" | "partners" | "industries" | "escalators" | "contact";

export const SITE_URL = "https://www.famousengineering.pk";

export const PAGE_PATHS: Record<Page, string> = {
  home: "/",
  services: "/services",
  partners: "/partners",
  industries: "/industries",
  projects: "/projects",
  about: "/why-fes",
  escalators: "/escalators",
  contact: "/contact",
};

export interface PageSeo {
  title: string;
  description: string;
  /** Visible H1/H2 used in the prerendered snapshot. */
  heading: string;
  intro: string;
}

export const PAGE_SEO: Record<Page, PageSeo> = {
  home: {
    title: "Lift, Elevator & Escalator Installation & Maintenance | FES Pakistan",
    description:
      "Lift, elevator, escalator and travelator installation, maintenance (AMC) and 24/7 breakdown service across Pakistan. Offices in Rawalpindi, Islamabad and Lahore.",
    heading: "Every floor, accounted for.",
    intro:
      "Lift, elevator, escalator and travelator installation, maintenance and 24/7 breakdown service for the buildings Pakistan depends on. Serving Pakistan since 2010 from offices in Rawalpindi, Islamabad and Lahore.",
  },
  services: {
    title: "Lift & Elevator Maintenance, Installation & Modernization | FES",
    description:
      "Lift and elevator maintenance (AMC), installation, modernization, repair and spare parts, plus escalator and travelator service across Pakistan. Get a quote from FES.",
    heading: "One accountable engineering partner.",
    intro:
      "FES covers the full life of your lifts and elevators: maintenance and AMC, supply and installation, modernization, plus escalator and travelator service.",
  },
  partners: {
    title: "BLT Authorized Elevator Partner & Multi-Brand Lift Service | FES",
    description:
      "FES is an authorized BLT elevator partner in Pakistan and provides independent lift and elevator maintenance, genuine spare parts, repair and modernization for other major brands.",
    heading: "Official Authorized Partner & Multi-Brand Support",
    intro:
      "Authorized BLT Brand Elevators partner for supply, installation and warranty, plus independent lift and elevator service, genuine parts, repair and modernization for other brands.",
  },
  industries: {
    title: "Lift & Elevator Service for Hospitals, Malls & Universities | FES",
    description:
      "Lift, elevator and escalator service for hospitals, commercial buildings, shopping malls, hotels, residential towers, universities, airports, industry and government sites in Pakistan.",
    heading: "Industries We Serve",
    intro: "Vertical transportation care for lifts, elevators and escalators, tailored to the way each type of building actually runs.",
  },
  projects: {
    title: "Lift & Elevator Projects in Rawalpindi, Islamabad & Lahore | FES",
    description:
      "Selected FES lift and elevator projects: AFIC, MCB Center, NUST, Bahria University, Air University, Giga City, INMOL Hospital and more across Rawalpindi, Islamabad, Lahore and beyond.",
    heading: "Care you can actually see.",
    intro: "Selected buildings across healthcare, commercial, education, retail and industrial sectors where FES maintains or installs lifts and elevators.",
  },
  about: {
    title: "Why Choose FES | Lift & Elevator Service Company in Pakistan",
    description:
      "Safety-led execution, visible service reporting and faster fault response: why building owners and facility teams choose FES for lift, elevator and escalator maintenance. FAQs answered.",
    heading: "Technical care should be visible before the fault is.",
    intro: "Safety-led execution, service visibility and faster fault response for lifts, elevators and escalators, plus answers to common service and maintenance questions.",
  },
  escalators: {
    title: "Escalator & Travelator Maintenance, Repair & Installation | FES",
    description:
      "Escalator, travelator and moving walkway installation, maintenance, repair and modernization for malls, airports and high-traffic buildings in Pakistan.",
    heading: "Escalator & Moving Systems",
    intro: "Installation and commissioning, maintenance and repair, modernization and upgrades for high-traffic escalators, travelators and moving walkways.",
  },
  contact: {
    title: "Contact FES | Lift & Elevator Service Rawalpindi, Islamabad, Lahore",
    description:
      "Request a quote or site assessment for lift, elevator or escalator service. Call 0304 4943377 or WhatsApp. Offices in Rawalpindi, Islamabad and Lahore.",
    heading: "Before downtime finds you.",
    intro: "Tell us about your lift, elevator or escalator requirement. A technical team member will get back to you with the right next step.",
  },
};

const PATH_TO_PAGE = new Map<string, Page>(
  (Object.keys(PAGE_PATHS) as Page[]).map((p) => [PAGE_PATHS[p], p]),
);

/** Normalises a pathname ("/services/" → "/services") and returns its page, or null when unknown. */
export function pageFromPath(pathname: string): Page | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return PATH_TO_PAGE.get(clean) ?? null;
}

/** Maps the legacy "#services"-style hashes used before real URLs existed. */
export function pageFromLegacyHash(hash: string): Page | null {
  const h = hash.replace("#", "").toLowerCase();
  if (!h || h === "top") return null;
  if (["company", "why-fes", "whyfes", "about"].includes(h)) return "about";
  if (["work", "portfolio", "projects"].includes(h)) return "projects";
  if (["services", "partners", "industries", "escalators", "contact"].includes(h)) return h as Page;
  return null;
}
