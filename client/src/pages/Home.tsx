/**
 * FES Premium Website — Vertical Precision Gallery
 * Features: 3D Lift Canvas, AI Consultant, Technology Partners, Industry Verticals, Escalator Services, Project Gallery
 */
import { FormEvent, useEffect, useState } from "react";
import StandaloneLiftCanvas from "@/components/StandaloneLiftCanvas";
import AiConsultant, { type InquiryData } from "@/components/AiConsultant";
import TechPartners from "@/components/TechPartners";
import Industries from "@/components/Industries";
import EscalatorServices from "@/components/EscalatorServices";
import Faq from "@/components/Faq";
import FaqSchema from "@/components/FaqSchema";
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
  Phone,
  ShieldCheck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const ASSETS = {
  hero: "/media/fes-hero-elevator-panoramic.jpg",
  installation: "/media/fes-installation-team_b1a62c10.png",
  control: "/media/fes-control-maintenance_03f5e598.png",
  doors: "/media/fes-door-maintenance_f0f973d4.png",
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
    title: "Maintenance & AMC",
    text: "Monthly preventive visits (or tailored to client demand), precision digital logs, and prompt breakdown support.",
  },
  {
    number: "02",
    icon: Building2,
    title: "Supply & Installation",
    text: "Building-specific passenger, hospital and freight systems delivered with discipline.",
  },
  {
    number: "03",
    icon: MoveUp,
    title: "Modernization",
    text: "Controllers, drives, doors and cabin upgrades that renew reliability without disruption.",
  },
  {
    number: "04",
    icon: CircleGauge,
    title: "Escalator Service",
    text: "Specialist care for high-traffic escalators, travelators and moving walkways.",
  },
];

interface ProjectItem {
  id: string;
  title: string;
  location: string;
  brand: string;
  category: "Healthcare" | "Commercial" | "Education" | "Retail" | "Industrial";
  photo: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: "afic",
    title: "Armed Forces Institute of Cardiology (AFIC)",
    location: "Rawalpindi",
    brand: "Hyundai Elevator / Xizi Otis",
    category: "Healthcare",
    photo: "/projects/afic.jpg",
  },
  {
    id: "mcb-center",
    title: "MCB Center",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/mcb-center.jpg",
  },
  {
    id: "giga-city",
    title: "Giga City",
    location: "Islamabad",
    brand: "Hyundai Elevator / Sigma",
    category: "Commercial",
    photo: "/projects/giga-city.jpg",
  },
  {
    id: "al-hafeez-heights",
    title: "Al Hafeez Height",
    location: "Lahore",
    brand: "Shanghai Mitsubishi",
    category: "Commercial",
    photo: "/projects/al-hafeez-heights.jpg",
  },
  {
    id: "nust-university",
    title: "NUST University",
    location: "Islamabad",
    brand: "Hyundai Elevator",
    category: "Education",
    photo: "/projects/nust-university.jpg",
  },
  {
    id: "bahria-university",
    title: "Bahria University",
    location: "Islamabad",
    brand: "Hyundai Elevator",
    category: "Education",
    photo: "/projects/bahria-university.jpg",
  },
  {
    id: "air-university",
    title: "Air University",
    location: "Islamabad",
    brand: "Hyundai Elevator",
    category: "Education",
    photo: "/projects/air-university.jpg",
  },
  {
    id: "inmol-hospital",
    title: "INMOL Hospital",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Healthcare",
    photo: "/projects/inmol-hospital.jpg",
  },
  {
    id: "begum-akhtar",
    title: "Begum Akhtar Rukhsana Hospital",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Healthcare",
    photo: "/projects/begum-akhtar.jpg",
  },
  {
    id: "comstech",
    title: "COMSTECH",
    location: "Islamabad",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/comstech.jpg",
  },
  {
    id: "liberty-tower",
    title: "Liberty Tower",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/liberty-tower.jpg",
  },
  {
    id: "gujranwala-business-center",
    title: "Gujranwala Business Center",
    location: "Gujranwala",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/gujranwala.jpg",
  },
  {
    id: "sod-pims",
    title: "School of Dentistry, SZABMU / PIMS",
    location: "Islamabad",
    brand: "Hyundai Elevator",
    category: "Education",
    photo: "/projects/sod-pims.jpg",
  },
  {
    id: "pakistan-intl-hospital",
    title: "Pakistan International Hospital",
    location: "Islamabad",
    brand: "Hospital Elevator",
    category: "Healthcare",
    photo: "/projects/pakistan-intl-hospital.jpg",
  },
  {
    id: "siddique-sadiq",
    title: "Siddique Sadiq Memorial Trust Hospital",
    location: "Gujranwala",
    brand: "Hospital Elevator",
    category: "Healthcare",
    photo: "/projects/siddique-sadiq.jpg",
  },
  {
    id: "chiniot-power",
    title: "Chiniot Power Limited",
    location: "Chiniot, Punjab",
    brand: "Industrial Elevator",
    category: "Industrial",
    photo: "/projects/chiniot-power.jpg",
  },
  {
    id: "gold-mine",
    title: "Gold Mine Plaza",
    location: "Ichhra, Lahore",
    brand: "Hyundai Elevator",
    category: "Retail",
    photo: "/projects/gold-mine.jpg",
  },
  {
    id: "imtiaz-sargodha",
    title: "Imtiaz Mega — Mall of Sargodha",
    location: "Sargodha",
    brand: "Hyundai Elevator",
    category: "Retail",
    photo: "/projects/imtiaz-sargodha.jpg",
  },
  {
    id: "imtiaz-barakahu",
    title: "Imtiaz Supermarket — SJ Centre",
    location: "Barakahu, Islamabad",
    brand: "Hyundai Elevator",
    category: "Retail",
    photo: "/projects/imtiaz-barakahu.jpg",
  },
  {
    id: "ali-tower",
    title: "Ali Tower",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/al-hafeez-heights.jpg",
  },
  {
    id: "rawal-mall",
    title: "Rawal Mall and Residencia",
    location: "Rawalpindi",
    brand: "Linvol Elevator",
    category: "Commercial",
    photo: "/projects/giga-city.jpg",
  },
  {
    id: "aashiana-center",
    title: "Aashiana Shopping Centre",
    location: "Liberty Chowk, Lahore",
    brand: "Hyundai Elevator",
    category: "Retail",
    photo: "/projects/aashiana-shopping-centre.jpg",
  },
  {
    id: "mcb-z-block",
    title: "MCB Z Block DHA",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/mcb-center.jpg",
  },
  {
    id: "devine-centre",
    title: "Devine Centre",
    location: "Lahore",
    brand: "Hyundai Elevator",
    category: "Commercial",
    photo: "/projects/liberty-tower.jpg",
  },
  {
    id: "sana-safinaz",
    title: "Sana Safinaz Z Block",
    location: "DHA Lahore",
    brand: "Semi Imported",
    category: "Retail",
    photo: "/projects/sana-safinaz.jpg",
  },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}><span />{children}</p>;
}

type Page = "home" | "about" | "services" | "projects" | "partners" | "industries" | "escalators" | "contact";
const pageFromHash = (): Page => {
  const hash = window.location.hash.replace("#", "").toLowerCase();
  if (hash === "company" || hash === "why-fes" || hash === "whyfes" || hash === "about") return "about";
  if (hash === "work" || hash === "portfolio" || hash === "projects") return "projects";
  if (["services", "partners", "industries", "escalators", "contact"].includes(hash)) return hash as Page;
  return "home";
};

export default function Home() {
  const [page, setPage] = useState<Page>(() => pageFromHash());
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [doorState, setDoorState] = useState<"idle" | "closing" | "opening">("idle");
  const [activeFloor, setActiveFloor] = useState(5);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [liftState, setLiftState] = useState<LiftState | null>(null);
  const [callFloor, setCallFloor] = useState<(floor: number) => void>(() => () => undefined);
  const [progress, setProgress] = useState(0);
  const [formSent, setFormSent] = useState(false);
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

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      setPage(next);
      window.location.hash = next === "home" ? "" : next;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    setDoorState("closing");
    window.setTimeout(() => {
      setPage(next);
      window.location.hash = next === "home" ? "" : next;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setDoorState("opening");
      window.setTimeout(() => setDoorState("idle"), 420);
    }, 380);
  };

  const handleForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
    event.currentTarget.reset();
    window.setTimeout(() => setFormSent(false), 5500);
  };

  const handleAiInquiry = (data: InquiryData) => {
    console.log("AI Inquiry received:", data);
  };

  const filteredProjects =
    projectFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === projectFilter);

  return (
    <main className={`site-shell page-${page}`}>
      <FaqSchema />
      <div className="scroll-line" style={{ transform: `scaleX(${progress / 100})` }} />

      <div className={`door-transition ${doorState}`} aria-hidden="true">
        <div className="transition-door transition-door-left" />
        <div className="transition-door transition-door-right" />
        <div className="transition-display"><ChevronDown size={16} /><span>FES</span><ChevronDown size={16} /></div>
      </div>

      <header className="site-header">
        <div className="nav-wrap">
          <button className="brand" onClick={() => navigate("top")} aria-label="Go to FES home">
            <span className="brand-logo-pill">
              <img src={ASSETS.logo} alt="Famous Engineering Services" />
            </span>
          </button>

          <nav className="desktop-nav" aria-label="Main navigation">
            <button className={page === "home" ? "is-active" : ""} onClick={() => navigate("top")}>Home</button>
            <button className={page === "services" ? "is-active" : ""} onClick={() => navigate("services")}>Services</button>
            <button className={page === "partners" ? "is-active" : ""} onClick={() => navigate("partners")}>Partners</button>
            <button className={page === "industries" ? "is-active" : ""} onClick={() => navigate("industries")}>Industries</button>
            <button className={page === "projects" ? "is-active" : ""} onClick={() => navigate("work")}>Our work</button>
            <button className={page === "about" ? "is-active" : ""} onClick={() => navigate("company")}>Why FES</button>
            <button className={page === "contact" ? "is-active" : ""} onClick={() => navigate("contact")}>Contact</button>
          </nav>

          <div className="nav-action">
            <a href="tel:+923044943377" className="phone-link"><Phone size={15} /> <span>0304 4943377</span></a>
            <button className="button button-small button-amber" onClick={() => navigate("contact")}>Request a quote <ArrowUpRight size={15} /></button>
            <button className="mobile-menu" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}>
          {[
            ["Home", "top", "home"],
            ["Services", "services", "services"],
            ["Partners", "partners", "partners"],
            ["Industries", "industries", "industries"],
            ["Our work", "work", "projects"],
            ["Why FES", "company", "about"],
            ["Contact", "contact", "contact"],
          ].map(([label, id, pageKey]) => (
            <button
              key={id}
              className={page === pageKey ? "is-active" : ""}
              onClick={() => navigate(id)}
            >
              {label}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </header>

      {page === "home" && (
        <section className="hero" id="top">
          <div className="hero-image" style={{ backgroundImage: `url(${ASSETS.hero})` }} />
          <div className="hero-tint" />
          <div className="hero-grain" />
          <div className="hero-layout">
            <div className="hero-copy">
              <Eyebrow light>Famous Engineering Services</Eyebrow>
              <h1>Every floor,<br /><em>accounted for.</em></h1>
              <p className="hero-intro">Precision installation, intelligent maintenance and responsive technical support for the buildings Pakistan depends on.</p>
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
              <StandaloneLiftCanvas
                onStateChange={(state) => {
                  setLiftState(state);
                  setActiveFloor(6 - state.currentFloor);
                  setMoving(state.moving);
                  setDoorsOpen(state.doorAmount > 0.35);
                }}
                onControlsReady={({ callFloor: control }) => setCallFloor(() => control)}
              />

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
              <span>Rawalpindi · Islamabad · Lahore · Pakistan</span>
              <span>Office #226, 2nd Floor, Rawal Mall and Residencia, Main Murree Road, Rawalpindi</span>
              <span>Office #06, First Floor, Al Kashif Plaza, G-10 Markaz, Islamabad</span>
              <span>Office No. M1-89, Aashiana Center, Main Boulevard, near Liberty Chowk, Lahore</span>
              <a href="https://www.google.com/maps/search/?api=1&query=Rawal+Mall+and+Residencia+Rawalpindi" target="_blank" rel="noreferrer">Open Rawalpindi map ↗</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Al+Kashif+Plaza+G10+Markaz+Islamabad" target="_blank" rel="noreferrer">Open Islamabad map ↗</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Aashiana+Center+Liberty+Chowk+Lahore" target="_blank" rel="noreferrer">Open Lahore map ↗</a>
              <a href="https://wa.me/923044943377" target="_blank" rel="noreferrer">WhatsApp FES ↗</a>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleForm}>
            <div className="assessment-header"><span>FES / SITE ASSESSMENT CONSOLE</span><b><i /> STATUS: READY</b></div>
            <div className="form-grid"><label>Full name<input required name="name" placeholder="Your full name" /></label><label>Phone number<input required name="phone" placeholder="+92 3XX XXXXXXX" /></label></div>
            <label>Email address<input required type="email" name="email" placeholder="you@company.com" /></label>
            <label>Service required<select name="service" defaultValue="Maintenance / AMC"><option>Maintenance / AMC</option><option>Supply & Installation</option><option>Modernization</option><option>Escalator service</option><option>Spare parts</option></select></label>
            <label>How can we help?<textarea required name="message" placeholder="Tell us about your building and requirement..." /></label>
            <button className="button button-amber button-submit" type="submit">Send enquiry <ArrowUpRight size={17} /></button>
            {formSent && <p className="form-success"><Check size={16} /> Thank you. Your message has been recorded.</p>}
          </form>
        </section>
      )}

      {page === "about" && <Faq />}

      <footer>
        <div className="footer-main">
          <div className="footer-brand">
            <span className="brand-logo-pill">
              <img src={ASSETS.logo} alt="Famous Engineering Services" />
            </span>
          </div>
          <p>Precision-first vertical transportation care for modern buildings across Pakistan.</p>
          <div className="footer-links"><button onClick={() => navigate("top")}>Home</button><button onClick={() => navigate("services")}>Services</button><button onClick={() => navigate("partners")}>Partners</button><button onClick={() => navigate("industries")}>Industries</button><button onClick={() => navigate("work")}>Our work</button><button onClick={() => navigate("contact")}>Contact</button></div>
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

      <AiConsultant onInquiry={handleAiInquiry} />
    </main>
  );
}
