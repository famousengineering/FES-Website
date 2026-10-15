/**
 * Technology Partners & Authorized Dealers
 * Showcases elevator manufacturers and technology partnerships
 */
import { ExternalLink } from "lucide-react";

export interface Partner {
  id: string;
  name: string;
  type: "manufacturer" | "partner" | "technology";
  description: string;
  specialization: string[];
  website?: string;
  featured?: boolean;
}

const PARTNERS: Partner[] = [
  {
    id: "blt",
    name: "BLT Brand Elevators",
    type: "manufacturer",
    description: "Shenyang Yuanda Intellectual Industry Group Co., Ltd. (China) — world-leading manufacturer of intelligent passenger elevators, hospital lifts, heavy freight systems, and escalators. FES is the officially authorized representative for bidding, sales, installation, commissioning, modernization, and warranty services in Pakistan.",
    specialization: [
      "High-speed & passenger elevators",
      "Hospital & stretcher elevators",
      "Commercial escalators & autowalks",
      "Machine-room-less (MRL) gearless lifts",
      "OEM spare parts & warranty servicing",
    ],
    website: "https://www.bltelevator.com",
    featured: true,
  },
  {
    id: "hyundai",
    name: "Hyundai Elevator",
    type: "manufacturer",
    description: "Leading global elevator manufacturer with presence in 190+ countries. Hyundai elevators feature advanced safety systems, energy efficiency, and reliability.",
    specialization: [
      "Passenger elevators",
      "Freight/cargo elevators",
      "Hospital elevators",
      "Machine-room-less (MRL)",
      "Gearless technology",
    ],
    website: "https://www.hyundai-elevator.com/en/",
    featured: true,
  },
  {
    id: "shanghai-mitsubishi",
    name: "Shanghai Mitsubishi Electric",
    type: "manufacturer",
    description: "Innovation-driven elevator solutions combining Japanese precision with global reach. Advanced systems for complex building requirements.",
    specialization: [
      "High-speed elevators",
      "Commercial systems",
      "Modernization solutions",
      "Smart building integration",
      "Destination control systems",
    ],
    website: "https://www.shec-china.com/",
    featured: true,
  },
  {
    id: "linvol",
    name: "Linvol Elevator",
    type: "manufacturer",
    description: "Specialized in customized elevator solutions for unique architectural requirements. Known for innovative designs and reliable performance.",
    specialization: [
      "Custom-design elevators",
      "Architectural integration",
      "Residential systems",
      "Modernization",
    ],
    website: undefined,
    featured: false,
  },
  {
    id: "sigma",
    name: "Sigma Elevators",
    type: "partner",
    description: "Quality elevator systems designed for reliability and performance. Proven track record in institutional and commercial applications.",
    specialization: [
      "Commercial elevators",
      "Institutional systems",
      "Maintenance programs",
      "Spare parts supply",
    ],
    website: undefined,
    featured: false,
  },
];

export default function TechPartners() {
  return (
    <section className="partners-section" aria-labelledby="partners-heading">
      <div className="partners-wrapper">
        {/* Section header */}
        <div className="section-head partners-head">
          <span className="section-number">03</span>
          <h2 id="partners-heading">
            Authorized Dealer <span>Technology Partners</span>
          </h2>
          <p>
            FES represents and services elevators and escalators from the world's most trusted manufacturers.
            Each partnership is selected for engineering excellence, reliability, and customer support capability.
          </p>
        </div>

        {/* Featured partners */}
        <div className="featured-partners">
          {PARTNERS.filter((p) => p.featured).map((partner) => (
            <div key={partner.id} className="partner-featured">
              <div className="partner-badge">{partner.type.toUpperCase()}</div>
              <h3>{partner.name}</h3>
              <p className="partner-description">{partner.description}</p>
              <div className="partner-specialization">
                <span className="spec-label">Specialization:</span>
                <ul className="spec-list">
                  {partner.specialization.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
              </div>
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-link"
                >
                  Visit website <ExternalLink size={16} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* All partners grid */}
        <div className="partners-grid">
          {PARTNERS.map((partner) => (
            <div key={partner.id} className="partner-card">
              <div className="partner-header">
                <h4>{partner.name}</h4>
                <span className="partner-type">{partner.type}</span>
              </div>
              <p className="partner-short">{partner.description.split(".")[0]}.</p>
              <ul className="partner-features">
                {partner.specialization.slice(0, 3).map((spec) => (
                  <li key={spec}>✓ {spec}</li>
                ))}
              </ul>
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-btn"
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Partnership benefits */}
        <div className="partnership-benefits">
          <h3>Why Partner with FES?</h3>
          <div className="benefits-grid">
            <div className="benefit">
              <span className="benefit-num">1</span>
              <h4>Authorized Service</h4>
              <p>Factory-trained technicians ensuring manufacturer specifications</p>
            </div>
            <div className="benefit">
              <span className="benefit-num">2</span>
              <h4>Genuine Parts</h4>
              <p>Original components for reliability and warranty protection</p>
            </div>
            <div className="benefit">
              <span className="benefit-num">3</span>
              <h4>Technical Support</h4>
              <p>Direct access to manufacturer engineering resources</p>
            </div>
            <div className="benefit">
              <span className="benefit-num">4</span>
              <h4>Comprehensive Contracts</h4>
              <p>Flexible AMC programs tailored to your building's needs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
