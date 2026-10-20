/**
 * FES Premium Website — Vertical Precision Gallery
 * Features: 3D Lift Canvas, AI Consultant, Technology Partners, Industry Verticals, Escalator Services, Project Gallery
 */
import { FormEvent, lazy, MouseEvent, Suspense, useEffect, useState } from "react";
import type { InquiryData } from "@/components/AiConsultant";
import { PROJECTS } from "@/data/projects";
import { PAGE_PATHS, PAGE_SEO, SITE_URL, pageFromLegacyHash, pageFromPath, type Page } from "@/lib/seo";
import NotFound from "@/pages/NotFound";
import TechPartners from "@/components/TechPartners";
import Industries from "@/components/Industries";
import EscalatorServices from "@/components/EscalatorServices";
import Faq from "@/components/Faq";
import ImpactCounter, { currentUnits, currentComplaints } from "@/components/ImpactCounter";
import type { LiftState } from "@/lib/standalone-lift-model";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  CircleGauge,
  Clock3,
  Menu,
  MoveUp,
  Mail,
  Phone,
  ShieldCheck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const ASSETS = {
  hero: "/media/fes-hero-elevator-panoramic.webp",
  installation: "/media/fes-installation-team_b1a62c10.webp",
  control: "/media/fes-control-maintenance_03f5e598.webp",
  doors: "/media/fes-door-maintenance_f0f973d4.webp",
  logo: "/branding/FES_Logo_Clean_Prominent.png",
  logoIcon: "/branding/FES_Icon_Transparent.png",
};

interface FloorItem {
  floorId: number;
  number: string;
  display: string;
  label: string;
}

const floors: FloorItem[] = [
  { floorId: 6, number: "05", display: "5", label: "Sky Lounge & Penthouse" },
  { floorId: 5, number: "04", display: "4", label: "Executive Offices" },
  { floorId: 4, number: "03", display: "3", label: "Commercial Studios" },
  { floorId: 3, number: "02", display: "2", label: "Tech Suites" },
  { floorId: 2, number: "01", display: "1", label: "Retail Galleria" },
  { floorId: 1, number: "G",  display: "G", label: "Main Lobby & Reception" },
];

const copButtons = [
  { floorId: 6, label: "5" },
  { floorId: 5, label: "4" },
  { floorId: 4, label: "3" },
  { floorId: 3, label: "2" },
  { floorId: 2, label: "1" },
  { floorId: 1, label: "G" },
];

const floorToDisplay = (floorId: number): string => {
  if (floorId === 1) return "G";
  return `0${floorId - 1}`;
};

const services = [
  {
    number: "01",
    icon: Wrench,
    title: "Lift & Elevator Maintenance (AMC)",
    text: "Monthly preventive visits (or tailored to client demand), precision digital logs, and prompt breakdown support.",
  },
  {
    number: "02",
    icon: Building2,
    title: "Lift & Elevator Supply and Installation",
    text: "Building-specific passenger, hospital and freight systems delivered with discipline.",
  },
  {
    number: "03",
    icon: MoveUp,
    title: "Lift Modernization",
    text: "Controllers, drives, doors and cabin upgrades that renew reliability without disruption.",
  },
  {
    number: "04",
    icon: CircleGauge,
    title: "Escalator & Travelator Service",
    text: "Specialist care for high-traffic escalators, travelators and moving walkways.",
  },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}><span />{children}</p>;
}

// Heavy, below-the-fold / on-demand widgets are code-split so they stay out of the first-load bundle
// (three.js alone is several hundred KB).
const StandaloneLiftCanvas = lazy(() => import("@/components/StandaloneLiftCanvas"));
const AiConsultant = lazy(() => import("@/components/AiConsultant"));

/** "notfound" is rendered for unknown URLs (the host serves 404.html with a real 404 status). */
type RoutePage = Page | "notfound";

/** Resolves the current URL to a page, upgrading legacy "/#services" links to real URLs. */
const pageFromLocation = (): RoutePage => {
  const legacy = pageFromLegacyHash(window.location.hash);
  if (legacy && window.location.pathname === "/") {
    window.history.replaceState(null, "", PAGE_PATHS[legacy]);
    return legacy;
  }
  return pageFromPath(window.location.pathname) ?? "notfound";
};

const NAV_ITEMS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Services", page: "services" },
  { label: "Partners", page: "partners" },
  { label: "Industries", page: "industries" },
  { label: "Our work", page: "projects" },
  { label: "Why FES", page: "about" },
  { label: "Contact", page: "contact" },
];

const OFFICES = [
  { city: "Rawalpindi", address: "Office #226, 2nd Floor, Rawal Mall and Residencia, Main Murree Road, Rawalpindi", map: "https://www.google.com/maps/search/?api=1&query=Rawal+Mall+and+Residencia+Rawalpindi" },
  { city: "Islamabad", address: "Office #06, First Floor, Al Kashif Plaza, G-10 Markaz, Islamabad", map: "https://www.google.com/maps/search/?api=1&query=Al+Kashif+Plaza+G10+Markaz+Islamabad" },
  { city: "Lahore", address: "Office No. M1-89, Aashiana Center, Main Boulevard, near Liberty Chowk, Lahore", map: "https://www.google.com/maps/search/?api=1&query=Aashiana+Center+Liberty+Chowk+Lahore" },
];

const FEATURED_PROJECT_IDS = ["afic", "mcb-center", "nust-university", "bahria-university", "giga-city", "inmol-hospital"];
const SERVICED_BRANDS = ["Hyundai", "Sigma", "Kone", "Schindler", "Otis", "Mitsubishi", "Fuji", "Thyssenkrupp"];
const GOOGLE_REVIEW_URL = "https://g.page/r/Ca4tEhdaxNYmEBM/review";

type FormStatus = "idle" | "sending" | "sent" | "error";

export default function Home() {
  const [page, setPage] = useState<RoutePage>(() => pageFromLocation());
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [doorState, setDoorState] = useState<"idle" | "closing" | "opening">("idle");
  const [activeFloor, setActiveFloor] = useState(5);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [liftState, setLiftState] = useState<LiftState | null>(null);
  const [callFloor, setCallFloor] = useState<(floor: number) => void>(() => () => undefined);
  const [progress, setProgress] = useState(0);
  const [showAi, setShowAi] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState("");
  const [formWhatsApp, setFormWhatsApp] = useState("");
  const [counterUnits, setCounterUnits] = useState(0);
  const [counterComplaints, setCounterComplaints] = useState(0);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetUnits = Math.floor(currentUnits(Date.now()));
    const targetComplaints = Math.floor(currentComplaints(Date.now()));

    let intervalId: number | undefined;
    let animFrameId: number | undefined;

    const startLiveUpdates = () => {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        setCounterUnits(Math.floor(currentUnits(now)));
        setCounterComplaints(Math.floor(currentComplaints(now)));
      }, 1000);
    };

    if (reduced) {
      setCounterUnits(targetUnits);
      setCounterComplaints(targetComplaints);
      startLiveUpdates();
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }

    const duration = 2200;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounterUnits(Math.floor(eased * targetUnits));
      setCounterComplaints(Math.floor(eased * targetComplaints));

      if (p < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        startLiveUpdates();
      }
    };
    animFrameId = requestAnimationFrame(step);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Load the AI widget chunk only after the page has settled, so it never competes with first paint.
  useEffect(() => {
    const show = () => setShowAi(true);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const id = idle ? idle(show, { timeout: 3000 }) : window.setTimeout(show, 2000);
    return () => {
      if (!idle) window.clearTimeout(id);
    };
  }, []);

  // Back/forward buttons and manually-typed "/#section" legacy links.
  useEffect(() => {
    const onLocationChange = () => setPage(pageFromLocation());
    window.addEventListener("popstate", onLocationChange);
    window.addEventListener("hashchange", onLocationChange);
    return () => {
      window.removeEventListener("popstate", onLocationChange);
      window.removeEventListener("hashchange", onLocationChange);
    };
  }, []);

  // Keep <title>, description, canonical and Open Graph in sync with the active page.
  useEffect(() => {
    const seo = page === "notfound" ? null : PAGE_SEO[page];
    const title = seo ? seo.title : "Page not found | Famous Engineering Services";
    const description = seo ? seo.description : "The page you requested could not be found.";
    const url = page === "notfound" ? null : `${SITE_URL}${PAGE_PATHS[page] === "/" ? "/" : PAGE_PATHS[page]}`;
    document.title = title;
    const setMeta = (selector: string, attr: string, value: string) =>
      document.head.querySelector(selector)?.setAttribute(attr, value);
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    if (url) {
      setMeta('link[rel="canonical"]', "href", url);
      setMeta('meta[property="og:url"]', "content", url);
    }
    setMeta('meta[name="robots"]', "content", page === "notfound" ? "noindex, follow" : "index, follow");
  }, [page]);

  useEffect(() => {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const navigate = (id: string) => {
    const nextPageMap: { [key: string]: Page } = {
      "top": "home",
      "home": "home",
      "company": "about",
      "why-fes": "about",
      "work": "projects",
      "projects": "projects",
    };
    const next: Page = nextPageMap[id] || (id as Page);
    setMobileNavOpen(false);
    if (page === next) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const go = () => {
      window.history.pushState(null, "", PAGE_PATHS[next]);
      setPage(next);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      go();
      return;
    }
    setDoorState("closing");
    window.setTimeout(() => {
      go();
      setDoorState("opening");
      window.setTimeout(() => setDoorState("idle"), 420);
    }, 380);
  };

  /** Real <a href> links (crawlable, open-in-new-tab friendly) that still use the animated in-app transition on a plain click. */
  const linkProps = (id: string, target: Page) => ({
    href: PAGE_PATHS[target],
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(id);
    },
  });

  const handleForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formStatus === "sending") return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setFormStatus("sending");
    setFormError("");
    setFormWhatsApp("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact_form" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "We couldn't send your request online right now.");
      }
      form.reset();
      setFormStatus("sent");
    } catch (error) {
      const summary = [
        "Hello FES, I would like to enquire about " + (data.service || "your services") + ".",
        data.name ? "Name: " + data.name : "",
        data.phone ? "Phone: " + data.phone : "",
        data.city ? "City: " + data.city : "",
        data.buildingType ? "Building: " + data.buildingType : "",
        data.message ? "Details: " + data.message : "",
      ].filter(Boolean).join("\n");
      setFormWhatsApp(`https://wa.me/923044943377?text=${encodeURIComponent(summary)}`);
      setFormError(error instanceof Error ? error.message : "We couldn't send your request online right now.");
      setFormStatus("error");
    }
  };

  const handleAiInquiry = (data: InquiryData) => {
    console.log("AI Inquiry received:", data);
  };

  const filteredProjects =
    projectFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === projectFilter);

  return (
    <main id="main-content" className={`site-shell page-${page}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="scroll-line" style={{ transform: `scaleX(${progress / 100})` }} />

      <div className={`door-transition ${doorState}`} aria-hidden="true">
        <div className="transition-door transition-door-left" />
        <div className="transition-door transition-door-right" />
        <div className="transition-display"><ChevronDown size={16} /><span>FES</span><ChevronDown size={16} /></div>
      </div>

      <header className="site-header">
        <div className="nav-wrap">
          <a className="brand" {...linkProps("top", "home")} aria-label="Go to FES home">
            <span className="brand-logo-pill">
              <img src={ASSETS.logo} alt="Famous Engineering Services" width={430} height={50} />
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Main navigation">
            {NAV_ITEMS.map(({ label, page: target }) => (
              <a
                key={target}
                className={page === target ? "is-active" : ""}
                aria-current={page === target ? "page" : undefined}
                {...linkProps(target, target)}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="nav-action">
            <a href="tel:+923044943377" className="phone-link"><Phone size={15} /> <span>0304 4943377</span></a>
            <a className="button button-small button-amber" {...linkProps("contact", "contact")}>Request a quote <ArrowUpRight size={15} /></a>
            <button className="mobile-menu" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}>
          {NAV_ITEMS.map(({ label, page: target }) => (
            <a
              key={target}
              className={page === target ? "is-active" : ""}
              aria-current={page === target ? "page" : undefined}
              {...linkProps(target, target)}
            >
              {label}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </header>

      {page === "notfound" && <NotFound />}

      {page === "home" && (
        <section className="hero" id="top">
          <div className="hero-image" style={{ backgroundImage: `url(${ASSETS.hero})` }} />
          <div className="hero-tint" />
          <div className="hero-grain" />
          <div className="hero-layout">
            <div className="hero-copy">
              <Eyebrow light>FES · Lifts, Elevators &amp; Escalators</Eyebrow>
              <h1>Every floor,<br /><em>accounted for.</em></h1>
              <p className="hero-intro">Lift, elevator, escalator and travelator installation, maintenance and 24/7 breakdown service for the buildings Pakistan depends on.</p>
              <div className="hero-actions">
                <button className="button button-amber" onClick={() => navigate("contact")}>Plan your site assessment <ArrowUpRight size={17} /></button>
                <button className="text-link text-link-light" onClick={() => navigate("services")}>Explore our services <ArrowDownRight size={18} /></button>
              </div>

              <div className="hero-proof hero-proof-clean">
                <span><strong>16+</strong> years of technical service</span>
                <i />
                <span><strong>Rapid</strong> breakdown response</span>
              </div>

              <div className="hero-bottom-band">
                <div className="hero-center-counter">
                  <div className="counter-eyebrow"><span className="eyebrow-dot" /> Since 2010 — Running Service Count</div>
                  <div className="counter-grid">
                    <div className="counter-card">
                      <div className="counter-live"><span className="live-dot" />LIVE</div>
                      <div className="counter-num" id="counterUnits">{counterUnits.toLocaleString()}</div>
                      <div className="counter-lbl">Elevators &amp; Escalators Serviced</div>
                    </div>
                    <div className="counter-card">
                      <div className="counter-live"><span className="live-dot" />LIVE</div>
                      <div className="counter-num" id="counterComplaints">{counterComplaints.toLocaleString()}</div>
                      <div className="counter-lbl">Customer Complaints Resolved</div>
                    </div>
                  </div>
                  <p className="counter-note">Running count since January 2010, based on our average monthly and daily service volumes.</p>
                </div>
              </div>
            </div>

            <div className="lift-stage restored-lift-stage" aria-label="Panoramic glass observation lift travelling between six floors">
              {floors.map((floor, index) => {
                const isCurrent = (liftState?.currentFloor ?? 1) === floor.floorId && !liftState?.moving;
                const isCalled = (liftState?.registeredCalls ?? []).includes(floor.floorId);
                return (
                  <button
                    type="button"
                    className={`shaft-floor ${isCurrent ? "is-active" : ""} ${isCalled ? "is-called" : ""}`}
                    style={{ top: `${index * 11.6 + 24}%` }}
                    key={floor.number}
                    onClick={() => callFloor(floor.floorId)}
                    title={`Call elevator to Floor ${floor.display} (${floor.label})`}
                    aria-label={`Call to floor ${floor.display}`}
                  >
                    <span className="floor-tick" />
                    <span className={isCalled ? "call-held-lamp" : ""}>
                      {floor.number}
                      {isCalled && <i className="call-beacon" />}
                    </span>
                    <b>{isCurrent ? "ON SITE" : isCalled ? "CALL HELD" : floor.label}</b>
                  </button>
                );
              })}
              <Suspense fallback={null}>
                <StandaloneLiftCanvas
                  onStateChange={(state) => {
                    setLiftState(state);
                    setActiveFloor(6 - state.currentFloor);
                    setMoving(state.moving);
                    setDoorsOpen(state.doorAmount > 0.35);
                  }}
                  onControlsReady={({ callFloor: control }) => setCallFloor(() => control)}
                />
              </Suspense>

              <div className="restored-readout" aria-live="polite">
                <small>{moving ? "IN TRANSIT" : "CABIN READY"}</small>
                <strong>{floorToDisplay(liftState?.currentFloor ?? 1)}</strong>
                <small>{moving ? (doorsOpen ? "OPENING" : "TRAVEL") : doorsOpen ? "DOORS OPEN" : "DWELL"}</small>
              </div>

              <div className="lift-status">
                <span className={moving ? "status-moving" : ""} /> {moving ? "TRAVELLING" : doorsOpen ? "DOORS OPEN" : "ARRIVED"}
              </div>
            </div>
          </div>
        </section>
      )}

      {page === "home" && (
        <section className="stats-band" aria-label="FES at a glance">
          <div className="stats-inner">
            <div><strong>300+</strong><span>Units under care</span></div>
            <div><strong>75+</strong><span>Active client sites</span></div>
            <div><strong>25+</strong><span>Technical specialists</span></div>
            <div><strong>2010</strong><span>Engineering since</span></div>
          </div>
        </section>
      )}

      {page === "home" && (
        <section className="intro-section" aria-labelledby="home-keywords">
          <div className="section-rail rail-intro" aria-hidden="true"><span>FES</span><i /><span>PK</span></div>
          <div className="section-number">01</div>
          <div className="intro-heading">
            <Eyebrow>Lifts, elevators, escalators &amp; travelators</Eyebrow>
            <h2 id="home-keywords">Vertical transportation, installed and <span>maintained</span> across Pakistan.</h2>
          </div>
          <div className="intro-body">
            <p>Famous Engineering Services (FES) installs, maintains, repairs and modernizes lifts, elevators, escalators and travelators (moving walkways) for hospitals, malls, offices, hotels, universities and residential buildings. Our vertical transportation service covers passenger, hospital and freight lifts, with monthly preventive maintenance contracts (AMC) and 24/7 breakdown response.</p>
            <p>From new lift installation and elevator modernization to escalator maintenance and genuine spare parts, our engineers service all major brands. FES is an authorized BLT elevator partner in Pakistan, with offices in Rawalpindi, Islamabad and Lahore.</p>
            <a className="text-link" {...linkProps("services", "services")}>Lift &amp; elevator services <ArrowUpRight size={18} /></a>
            {" "}
            <a className="text-link" {...linkProps("escalators", "escalators")}>Escalators &amp; travelators <ArrowUpRight size={18} /></a>
          </div>
        </section>
      )}

      {page === "home" && (
        <>
          <section className="home-services" aria-labelledby="home-services-title">
            <div className="home-wrap">
              <Eyebrow light>What we do</Eyebrow>
              <h2 id="home-services-title">Lifecycle care for lifts, elevators &amp; escalators.</h2>
              <div className="home-service-grid">
                {services.map((service) => {
                  const Icon = service.icon;
                  const target: Page = service.number === "04" ? "escalators" : "services";
                  return (
                    <a className="home-service-card" key={service.number} {...linkProps(target, target)}>
                      <span className="home-service-icon"><Icon size={24} strokeWidth={1.6} /></span>
                      <h3>{service.title}</h3>
                      <p>{service.text}</p>
                      <span className="home-card-link">Learn more <ArrowUpRight size={16} /></span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="home-projects" aria-labelledby="home-projects-title">
            <div className="home-wrap">
              <Eyebrow>Our work</Eyebrow>
              <h2 id="home-projects-title">Trusted in hospitals, universities and towers.</h2>
              <div className="home-project-grid">
                {FEATURED_PROJECT_IDS.map((id) => PROJECTS.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p)).map((p) => (
                  <a className="home-project-card" key={p.id} {...linkProps("projects", "projects")}>
                    <img src={p.photo} alt={`${p.title}, ${p.location}`} loading="lazy" width={600} height={400} />
                    <span className="home-project-meta">
                      <b>{p.title}</b>
                      <small>{p.location} · {p.category}</small>
                    </span>
                  </a>
                ))}
              </div>
              <a className="text-link home-all-projects" {...linkProps("projects", "projects")}>View all {PROJECTS.length} projects <ArrowUpRight size={18} /></a>
            </div>
          </section>

          <section className="home-brands" aria-label="Authorized partner and serviced brands">
            <div className="home-wrap">
              <p><strong>Authorized BLT elevator partner</strong> in Pakistan. We also maintain and repair:</p>
              <ul>
                {SERVICED_BRANDS.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </section>

          <section className="home-cta" aria-labelledby="home-cta-title">
            <div className="home-wrap">
              <h2 id="home-cta-title">Need a lift installed, serviced or modernized?</h2>
              <p>Tell us about your building. We will arrange a site assessment and a clear quotation.</p>
              <div className="home-cta-actions">
                <a className="button button-amber" {...linkProps("contact", "contact")}>Request a quote <ArrowUpRight size={17} /></a>
                <a className="button button-ghost" href="tel:+92514943377"><Phone size={16} /> 051 4943377</a>
                <a className="button button-ghost" href="https://wa.me/923044943377?text=Hello%20FES%2C%20I%20would%20like%20to%20inquire%20about%20elevator%20services." target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
              <a className="home-review-link" href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">Worked with FES? Leave us a Google review ↗</a>
            </div>
          </section>
        </>
      )}


      {page === "about" && (
        <section className="intro-section" id="company">
          <div className="section-rail rail-intro" aria-hidden="true"><span>01</span><i /><span>06</span></div>
          <div className="section-number">01</div>
          <div className="intro-heading">
            <Eyebrow>Built for buildings that stay open</Eyebrow>
            <h2>Technical care should be <span>visible before</span> the fault is.</h2>
          </div>
          <div className="intro-body">
            <p>FES supports hospitals, malls, commercial towers and residential developments with a service model built around anticipation—not simply repair. Every visit is organized around safety, clarity and dependable movement.</p>
            <button className="text-link" onClick={() => navigate("contact")}>Speak to our service team <ArrowUpRight size={18} /></button>
          </div>
        </section>
      )}

      {page === "services" && (
        <>
          <section className="service-section" id="services">
            <div className="section-rail rail-service" aria-hidden="true"><span>LIFE</span><i /><span>CYCLE</span></div>
            <div className="section-top">
              <div><Eyebrow light>Lifecycle services</Eyebrow><h2>One accountable<br />engineering partner.</h2></div>
              <p>From the first shaft drawing to urgent breakdown dispatch, FES protects the full life of your vertical transportation systems.</p>
            </div>
            <div className="services-list">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <article className="service-row" key={service.number}>
                    <span className="service-num">{service.number}</span>
                    <span className="service-icon"><Icon size={26} strokeWidth={1.6} /></span>
                    <div><h3>{service.title}</h3><p>{service.text}</p></div>
                    <button
                      className="service-arrow"
                      onClick={() => service.number === "04" ? navigate("escalators") : navigate("contact")}
                      aria-label={`Ask about ${service.title}`}
                    >
                      <ArrowUpRight size={22} />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
          <EscalatorServices />
        </>
      )}

      {page === "partners" && <TechPartners />}

      {page === "industries" && <Industries />}

      {page === "escalators" && <EscalatorServices />}

      {page === "projects" && (
        <section className="work-section" id="work">
          <div className="section-rail rail-work" aria-hidden="true"><span>SITE</span><i /><span>LOG</span></div>
          <div className="work-heading">
            <div><span className="section-number">02</span><Eyebrow>Engineering on site</Eyebrow></div>
            <h2>Care you can<br /><span>actually see.</span></h2>
            <p>Our work is not hidden behind an annual contract. The technician, the checklist, the precision—and the verified photographic result—remain visible across our client portfolio in Pakistan.</p>
          </div>

          <div className="work-filter-bar" role="tablist" aria-label="Project Categories">
            {["All", "Healthcare", "Commercial", "Education", "Retail", "Industrial"].map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={projectFilter === cat}
                className={`work-pill ${projectFilter === cat ? "is-active" : ""}`}
                onClick={() => setProjectFilter(cat)}
              >
                {cat} {cat === "All" ? `(${PROJECTS.length})` : ""}
              </button>
            ))}
          </div>

          <div className="work-grid">
            {filteredProjects.map((project, index) => (
              <article className="work-card" key={project.id}>
                <div className="work-image">
                  <img src={project.photo} alt={project.title} loading="lazy" />
                  <span className="work-category-badge">{project.category}</span>
                </div>
                <div className="work-content">
                  <span className="card-meta">PROJECT #{String(index + 1).padStart(2, "0")} · {project.category.toUpperCase()}</span>
                  <h3>{project.title}</h3>
                  <p className="work-specs">{project.location} · {project.brand}</p>
                  <button onClick={() => navigate("contact")} aria-label={`Contact FES about ${project.title}`}>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {page === "about" && (
        <section className="assurance-section">
          <div className="section-rail rail-assurance" aria-hidden="true"><span>CHECK</span><i /><span>PASS</span></div>
          <div className="assurance-image"><img src={ASSETS.installation} alt="FES elevator installation technicians at work" /><div className="image-measure"><span>SHAFT ALIGNMENT</span><b>± 0.0</b></div></div>
          <div className="assurance-copy">
            <Eyebrow>Why building teams choose FES</Eyebrow>
            <h2>Dependability is engineered <em>long before</em> arrival.</h2>
            <div className="assurance-points">
              <div><ShieldCheck size={22} /><div><h3>Safety-led execution</h3><p>Work completed to manufacturer specifications and responsible site standards.</p></div></div>
              <div><Clock3 size={22} /><div><h3>Service visibility</h3><p>Scheduled care, clear reporting and a direct route to our technical team.</p></div></div>
              <div><Zap size={22} /><div><h3>Faster fault response</h3><p>Trained technicians and original parts ready for high-priority site needs.</p></div></div>
            </div>
          </div>
        </section>
      )}

      {page === "contact" && (
        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <Eyebrow light>Start a conversation</Eyebrow>
            <h2>Before downtime finds you.</h2>
            <p>Tell us about your building, system or service requirement. A technical team member will get back to you with the right next step.</p>
            <div className="contact-details">
              <a href="tel:+923044943377"><Phone size={17} /> 0304 4943377</a>
              <a href="mailto:famousengineering.pk@gmail.com"><Mail size={17} /> famousengineering.pk@gmail.com</a>
              <a href="tel:+92514943377"><Phone size={17} /> 051 4943377 (PTCL)</a>
              <a href="https://wa.me/923044943377" target="_blank" rel="noreferrer">WhatsApp FES ↗</a>
            </div>
            <div className="office-cards">
              {OFFICES.map((o) => (
                <article className="office-card" key={o.city}>
                  <h3>{o.city}</h3>
                  <p>{o.address}</p>
                  <a href={o.map} target="_blank" rel="noreferrer">Open {o.city} map ↗</a>
                </article>
              ))}
            </div>
          </div>
          <form className="contact-form" onSubmit={handleForm}>
            <div className="assessment-header"><span>FES / SITE ASSESSMENT CONSOLE</span><b><i /> STATUS: READY</b></div>
            <div className="form-grid">
              <label>Full name<input required name="name" autoComplete="name" maxLength={200} placeholder="Your full name" /></label>
              <label>Phone number<input required type="tel" name="phone" autoComplete="tel" inputMode="tel" maxLength={32} pattern="[0-9+()\-.\s]{7,32}" title="Enter a valid phone number, e.g. +92 3XX XXXXXXX" placeholder="+92 3XX XXXXXXX" /></label>
            </div>
            <label>Email address<input type="email" name="email" autoComplete="email" maxLength={320} placeholder="you@company.com (optional)" /></label>
            <div className="form-grid">
              <label>City<input name="city" autoComplete="address-level2" maxLength={100} placeholder="Lahore, Islamabad, Rawalpindi…" /></label>
              <label>Building type<select name="buildingType" defaultValue=""><option value="">Select (optional)</option><option>Hospital / Medical</option><option>Commercial / Office</option><option>Mall / Retail</option><option>Hotel</option><option>Residential</option><option>University / School</option><option>Industrial / Warehouse</option><option>Government</option><option>Other</option></select></label>
            </div>
            <label>Service required<select name="service" defaultValue="Maintenance / AMC"><option>Maintenance / AMC</option><option>Supply & Installation</option><option>Modernization</option><option>Escalator service</option><option>Spare parts</option></select></label>
            <label>How can we help?<textarea required name="message" maxLength={4000} placeholder="Tell us about your building and requirement..." /></label>
            {/* Honeypot: invisible to people, filled in by bots. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
              <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <button className="button button-amber button-submit" type="submit" disabled={formStatus === "sending"}>
              {formStatus === "sending" ? "Sending…" : "Send enquiry"} <ArrowUpRight size={17} />
            </button>
            <p className="form-note" style={{ fontSize: 12, opacity: 0.7, margin: "10px 0 0" }}>
              We use your details only to respond to this enquiry.
            </p>
            <div aria-live="polite">
              {formStatus === "sent" && <p className="form-success"><Check size={16} /> Thank you. Your enquiry has been sent to the FES team — we will contact you shortly.</p>}
              {formStatus === "error" && (
                <p className="form-error" role="alert" style={{ color: "#ffb4a8", marginTop: 12 }}>
                  {formError}{" "}
                  <a href={formWhatsApp} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                    Send it on WhatsApp instead
                  </a>{" "}
                  or call <a href="tel:+923044943377" style={{ color: "inherit", textDecoration: "underline" }}>0304 4943377</a>.
                </p>
              )}
            </div>
          </form>
        </section>
      )}

      {page === "about" && <Faq />}

      <footer>
        <div className="footer-cols">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="brand-logo-pill">
                <img src={ASSETS.logo} alt="Famous Engineering Services" width={430} height={50} />
              </span>
            </div>
            <p>Lift, elevator and escalator installation, maintenance and modernization across Pakistan. Authorized BLT elevator partner. Serving since 2010.</p>
          </div>
          <nav aria-label="Footer navigation">
            <h3>Explore</h3>
            <ul>
              {NAV_ITEMS.map(({ label, page: target }) => (
                <li key={target}><a {...linkProps(target, target)}>{label}</a></li>
              ))}
              <li><a {...linkProps("escalators", "escalators")}>Escalators &amp; travelators</a></li>
            </ul>
          </nav>
          <div>
            <h3>Contact</h3>
            <ul>
              <li><a href="tel:+92514943377">051 4943377 (PTCL)</a></li>
              <li><a href="tel:+923044943377">0304 4943377</a></li>
              <li><a href="https://wa.me/923044943377" target="_blank" rel="noreferrer">WhatsApp</a></li>
              <li><a href="mailto:famousengineering.pk@gmail.com">famousengineering.pk@gmail.com</a></li>
            </ul>
          </div>
          <div>
            <h3>Offices</h3>
            <ul>
              {OFFICES.map((o) => (
                <li key={o.city}><b>{o.city}</b><span>{o.address}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 FES. All rights reserved.</span><span>Reliable movement, engineered.</span></div>
      </footer>

      <a
        className="floating-whatsapp"
        href="https://wa.me/923044943377?text=Hello%20FES%2C%20I%20would%20like%20to%20inquire%20about%20elevator%20services."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Famous Engineering Services on WhatsApp"
      >
        <span className="wa-icon-wrap">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm-3.53 4.14c-.19 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.06 3.29 5.09 4.49.72.29 1.28.46 1.72.6.72.23 1.38.2 1.9.12.58-.09 1.79-.73 2.05-1.44.25-.71.25-1.32.18-1.44-.07-.12-.27-.2-.56-.34-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01z"/>
          </svg>
        </span>
        <b>Chat with FES</b>
      </a>

      {showAi && (
        <Suspense fallback={null}>
          <AiConsultant onInquiry={handleAiInquiry} />
        </Suspense>
      )}
    </main>
  );
}
