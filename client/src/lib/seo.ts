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
    title: "FES | Famous Engineering Services - Premium Elevators & Escalators",
    description:
      "FES (Famous Engineering Services) delivers precision elevator and escalator installation, monthly preventive maintenance, modernization and emergency response across Pakistan.",
    heading: "Every floor, accounted for.",
    intro:
      "Precision installation, intelligent maintenance and responsive technical support for the buildings Pakistan depends on. Serving Pakistan since 2010 from offices in Rawalpindi, Islamabad and Lahore.",
  },
  services: {
    title: "Elevator Maintenance, Installation & Modernization | FES",
    description:
      "Elevator AMC and preventive maintenance, supply and installation, modernization and escalator service across Pakistan, with prompt breakdown support from FES.",
    heading: "One accountable engineering partner.",
    intro:
      "FES covers the full elevator lifecycle: maintenance and AMC, supply and installation, modernization and escalator service.",
  },
  partners: {
    title: "BLT Authorized Partner & Multi-Brand Elevator Service | FES",
    description:
      "FES is an authorized partner for BLT elevators in Pakistan and provides independent maintenance, genuine parts, repair and modernization for other major elevator brands.",
    heading: "Official Authorized Partner & Multi-Brand Support",
    intro:
      "Authorized BLT Brand Elevators partner for supply, installation and warranty, plus independent service, genuine parts, repair and modernization for other brands.",
  },
  industries: {
    title: "Elevator Services for Hospitals, Malls & Universities | FES",
    description:
      "Elevator and escalator service for hospitals, commercial buildings, shopping malls, hotels, residential towers, universities, airports, industry and government sites in Pakistan.",
    heading: "Industries We Serve",
    intro: "Vertical-transportation care tailored to the way each type of building actually runs.",
  },
  projects: {
    title: "Our Elevator Projects Across Pakistan | FES",
    description:
      "Selected FES elevator projects: AFIC, MCB Center, NUST, Bahria University, Air University, Giga City, INMOL Hospital and more across Rawalpindi, Islamabad, Lahore and beyond.",
    heading: "Care you can actually see.",
    intro: "Selected buildings across healthcare, commercial, education, retail and industrial sectors where FES maintains or installs elevators.",
  },
  about: {
    title: "Why Choose FES | Elevator Service Company in Pakistan",
    description:
      "Safety-led execution, visible service reporting and faster fault response: why building owners and facility teams choose FES for elevator and escalator care. FAQs answered.",
    heading: "Technical care should be visible before the fault is.",
    intro: "Safety-led execution, service visibility and faster fault response, plus answers to common elevator service questions.",
  },
  escalators: {
    title: "Escalator & Moving Walkway Maintenance in Pakistan | FES",
    description:
      "Specialist escalator, travelator and moving walkway installation, maintenance, repair and modernization for malls, airports and high-traffic buildings in Pakistan.",
    heading: "Escalator & Moving Systems",
    intro: "Installation and commissioning, maintenance and repair, modernization and upgrades for high-traffic escalators and moving walkways.",
  },
  contact: {
    title: "Contact FES | Rawalpindi, Islamabad & Lahore Offices",
    description:
      "Request a quote or site assessment from FES. Call 0304 4943377 or WhatsApp. Offices in Rawalpindi, Islamabad and Lahore for elevator and escalator service.",
    heading: "Before downtime finds you.",
    intro: "Tell us about your building, system or service requirement. A technical team member will get back to you with the right next step.",
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
