/**
 * Technology Partners & Multi-Brand Engineering Support
 * Clear distinction: BLT is our authorized OEM partner in Pakistan,
 * while for all other global brands we provide independent multi-brand services, parts, repairs & modernization
 */
import { ExternalLink, ShieldCheck, Award, Wrench, Cpu, CheckCircle2, FileText, AlertCircle } from "lucide-react";

export interface SupportedBrand {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  services: string[];
}

const SUPPORTED_BRANDS: SupportedBrand[] = [
  {
    id: "otis",
    name: "Otis / Xizi Otis",
    country: "USA / Global",
    tagline: "Microprocessor & GeN2 Platform Care",
    description: "Comprehensive lifecycle maintenance, controller diagnostics, genuine door operator & belt replacements, and full system modernization retrofits for Otis installations.",
    services: ["Preventive AMC Contracts", "GeN2 & Microprocessor Diagnostics", "Genuine Spare Parts Sourcing", "Modernization Retrofits"],
  },
  {
    id: "shanghai-mitsubishi",
    name: "Shanghai Mitsubishi",
    country: "Japan / China",
    tagline: "High-Speed Commercial Systems",
    description: "Expert preventive maintenance, variable frequency inverter overhauls, authentic electronic boards, and destination dispatch modernization for high-traffic towers.",
    services: ["High-Speed Lift Servicing", "VF Inverter Overhauls", "Genuine Electronic Boards", "Cabin & Control Modernization"],
  },
  {
    id: "hyundai",
    name: "Hyundai Elevator",
    country: "South Korea",
    tagline: "Heavy Commercial & Residential Transit",
    description: "24/7 rapid emergency breakdown support, scheduled monthly inspections, authentic traction ropes, guide rollers, and complete controller upgrades.",
    services: ["24/7 Breakdown Dispatch", "Scheduled Monthly Inspections", "Traction Rope & Roller Replacement", "Controller Upgrades"],
  },
  {
    id: "schindler",
    name: "Schindler",
    country: "Switzerland",
    tagline: "Precision European Mobility",
    description: "Smart controller diagnostics, safety circuit testing, traction machine servicing, and genuine component replacements for Schindler passenger systems.",
    services: ["Safety Circuit Certification", "Machine & Brake Servicing", "Genuine Replacement Parts", "Electronic Board Diagnostics"],
  },
  {
    id: "kone",
    name: "Kone",
    country: "Finland",
    tagline: "EcoDisc & Gearless Technologies",
    description: "EcoDisc hoisting motor inspection, drive and resolver tuning, door operator rebuilds, and customized annual maintenance agreements (AMC).",
    services: ["EcoDisc Motor Maintenance", "Drive & Resolver Calibration", "Door Mechanism Overhaul", "Tailored AMC Programs"],
  },
  {
    id: "fuji",
    name: "Fuji / FujiHD",
    country: "Japan / Global",
    tagline: "Reliable Passenger & Cargo Systems",
    description: "Routine lubrication, drive inverter replacement, safety governor testing, passenger entrapment rescue support, and authentic spare parts supply.",
    services: ["Drive Inverter Replacements", "Governor & Safety Audits", "Passenger Rescue Support", "Authentic Components"],
  },
  {
    id: "sigma",
    name: "Sigma / LG-Otis",
    country: "South Korea",
    tagline: "Institutional & Commercial Towers",
    description: "Legacy relay-to-microprocessor upgrades, guide shoe replacement, hoist rope tensioning, and dependable preventive maintenance for commercial installations.",
    services: ["Relay-to-Microprocessor Retrofit", "Guide Shoe & Rope Servicing", "Preventive Maintenance AMC", "Original Component Sourcing"],
  },
  {
    id: "thyssenkrupp",
    name: "Thyssenkrupp / TKE",
    country: "Germany",
    tagline: "Hydraulic & Traction Engineering",
    description: "Hydraulic power unit servicing, traction machine brake overhauls, safety gear recalibration, and aesthetic cabin modernizations.",
    services: ["Hydraulic & Traction Servicing", "Safety Brake Overhauls", "Cabin Interior Renovation", "Full Controller Modernization"],
  },
];

export default function TechPartners() {
  return (
    <section className="partners-section" id="partners" aria-labelledby="partners-heading">
      <div className="partners-wrapper">
        
        {/* Section Header */}
        <div className="section-head partners-head">
          <span className="section-number">03 / PARTNER & BRAND ARCHITECTURE</span>
          <h2 id="partners-heading">
            Official Authorized Partner & <span>Multi-Brand Support</span>
          </h2>
          <p>
            Famous Engineering Services (FES) operates with absolute commercial clarity. 
            We are an <strong>officially authorized partner in Pakistan for BLT Brand Elevators</strong> for new equipment supply, tenders, certified installation, and factory warranty. 
            For all other international manufacturers, we provide independent lifecycle engineering: 24/7 emergency repair, planned preventive maintenance (AMC), genuine spare parts, and modernization retrofits.
          </p>
        </div>

        {/* TIER 1: AUTHORIZED OEM PARTNER (BLT) */}
        <div className="blt-hero-card" role="region" aria-label="Authorized Partner: BLT">
          <div className="blt-card-glow" aria-hidden="true" />
          
          <div className="blt-card-top">
            <div className="blt-badge-group">
              <span className="blt-exclusive-badge">
                <Award size={14} className="badge-icon" /> AUTHORIZED OEM PARTNER IN PAKISTAN
              </span>
              <span className="blt-origin-badge">Shenyang Yuanda Group (China)</span>
            </div>
            <span className="blt-status-pill">
              <ShieldCheck size={14} /> Factory OEM Warranty & Engineering Alignment
            </span>
          </div>

          <div className="blt-card-body">
            <div className="blt-brand-col">
              <div className="blt-logo-frame">
                <img 
                  src="/certificates/blt-header-logo.png" 
                  alt="BLT Brand Elevators Logo" 
                  className="blt-official-logo"
                  loading="lazy"
                />
              </div>
              <h3 className="blt-title">BLT Brand Elevators</h3>
              <p className="blt-subtitle">Shenyang Yuanda Intellectual Industry Group Co., Ltd.</p>
              <p className="blt-desc">
                World-leading elevator manufacturer with landmark global installations. FES is the officially authorized representative in Pakistan for bidding, sales, equipment import, certified installation, commissioning, OEM warranty execution, and genuine factory spare parts.
              </p>

              <div className="blt-action-row">
                <a 
                  href="/certificates/blt-authorization-certificate.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="blt-cert-btn"
                  title="View Official BLT Manufacturer Authorization Certificate"
                >
                  <FileText size={16} /> View Authorization Certificate
                </a>
                <a 
                  href="https://www.bltelevator.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="blt-web-link"
                  title="Visit BLT Global Website"
                >
                  Official BLT Portal <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="blt-scope-col">
              <h4 className="blt-scope-heading">Official Authorized Scope & Factory Backing</h4>
              <ul className="blt-scope-list">
                <li>
                  <CheckCircle2 size={18} className="scope-icon" />
                  <div>
                    <strong>New Equipment Supply & Tenders:</strong> Complete portfolio including high-speed passenger lifts (up to 8 m/s), panoramic observation cabins, bed/hospital stretchers, and heavy freight lifts.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={18} className="scope-icon" />
                  <div>
                    <strong>Commercial Escalators & Moving Walkways:</strong> Heavy-duty public transport and shopping mall grade moving walkways and escalators.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={18} className="scope-icon" />
                  <div>
                    <strong>OEM Factory Warranty & Support:</strong> 100% direct factory warranty fulfillment with engineering drawings and technical escalation to Yuanda headquarters.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={18} className="scope-icon" />
                  <div>
                    <strong>Certified Installation & Commissioning:</strong> Factory-trained FES site engineers adhering strictly to international EN81 / ASME A17.1 elevator safety codes.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={18} className="scope-icon" />
                  <div>
                    <strong>Factory-Direct Spare Parts Pipeline:</strong> Authentic circuit boards, traction machines, door drives, and safety sensors sourced directly from the production line.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* TIER 2: MULTI-BRAND ENGINEERING, SPARE PARTS & MODERNIZATION */}
        <div className="multibrand-heading-block">
          <div className="multibrand-eyebrow">
            <Wrench size={16} /> MULTI-BRAND ENGINEERING & LIFECYCLE SUPPORT
          </div>
          <h3>Independent Service, Genuine Parts, Repair & Modernization</h3>
          <p>
            For existing commercial, healthcare, institutional, and residential facilities across Pakistan operating non-BLT elevators, 
            FES delivers independent technical excellence. Our veteran engineers provide round-the-clock emergency response, 
            disciplined preventive maintenance (AMC), authentic spare parts sourcing, and comprehensive controller modernization.
          </p>
        </div>

        {/* Brand Grid */}
        <div className="supported-brands-grid">
          {SUPPORTED_BRANDS.map((brand) => (
            <div key={brand.id} className="brand-card">
              <div className="brand-card-top">
                <div>
                  <h4 className="brand-name">{brand.name}</h4>
                  <span className="brand-origin">{brand.country}</span>
                </div>
                <span className="brand-service-badge">Independent Care</span>
              </div>
              
              <div className="brand-tagline">{brand.tagline}</div>
              <p className="brand-description">{brand.description}</p>
              
              <div className="brand-services-box">
                <span className="services-title">Services Provided by FES:</span>
                <ul className="brand-services-list">
                  {brand.services.map((srv) => (
                    <li key={srv}>
                      <span className="srv-bullet">✓</span> {srv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Engineering Advisory Notice */}
        <div className="brand-advisory-box" role="note">
          <AlertCircle size={24} className="advisory-icon" />
          <div className="advisory-text">
            <strong>Engineering & Trademark Notice:</strong>
            <p>
              <strong>BLT Brand Elevators</strong> is the authorized manufacturer partner of Famous Engineering Services (FES). 
              Otis, Shanghai Mitsubishi, Hyundai, Schindler, Kone, Fuji, Sigma, and Thyssenkrupp are registered trademarks of their respective manufacturers. 
              FES provides independent engineering, preventive maintenance contracts (AMC), emergency breakdown services, authentic spare parts sourcing, and controller modernizations based on over two decades of verified field experience in Pakistan.
            </p>
          </div>
        </div>

        {/* 4 CORE SERVICE DELIVERABLES */}
        <div className="service-pillars-block">
          <h3 className="pillars-title">The FES Multi-Brand Lifecycle Advantage</h3>
          <p className="pillars-sub">Why property managers and facility directors trust FES for their building's vertical transit systems:</p>
          
          <div className="pillars-grid">
            <div className="pillar-item">
              <div className="pillar-num">01</div>
              <div className="pillar-content">
                <h4>24/7 Rapid Emergency Response</h4>
                <p>Dedicated standby mobile teams with average 45-60 minute on-site arrival across Rawalpindi, Islamabad, and Lahore.</p>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-num">02</div>
              <div className="pillar-content">
                <h4>Authentic Spare Parts Sourcing</h4>
                <p>Guaranteed genuine microprocessors, contactors, guide shoes, encoders, and traction cables tested for exact compatibility.</p>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-num">03</div>
              <div className="pillar-content">
                <h4>Controller & Drive Modernization</h4>
                <p>Renew 15-20+ year-old elevators with modern VVVF microprocessors, silent door operators, and luxury cabins without shaft demolition.</p>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-num">04</div>
              <div className="pillar-content">
                <h4>Disciplined Preventive AMC</h4>
                <p>Scheduled monthly inspections, safety circuit audits, detailed digital site logs, and predictable operational uptime.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
