/**
 * Industries & Verticals — Showcase sectors FES serves
 */
import {
  Building2,
  Activity,
  Users,
  Briefcase,
  ShoppingCart,
  GraduationCap,
  Plane,
  Factory,
  Armchair,
  Stethoscope,
} from "lucide-react";

interface Industry {
  id: string;
  name: string;
  icon: React.ComponentType<{ size: number }>;
  description: string;
  benefits: string[];
  color: string;
}

const INDUSTRIES: Industry[] = [
  {
    id: "hospitals",
    name: "Hospitals & Medical",
    icon: Stethoscope,
    description:
      "Critical care facilities demand absolute reliability. Our elevators meet strict medical standards with contamination control and accessibility features.",
    benefits: [
      "Accessibility compliance (ADA/PEC)",
      "Hygiene-optimized cabins",
      "Reliable emergency backup",
      "Emergency-load handling",
      "Dedicated technical support",
    ],
    color: "hospital",
  },
  {
    id: "commercial",
    name: "Commercial & Corporate",
    icon: Building2,
    description:
      "High-traffic office towers and commercial complexes need elevators that never compromise productivity. We provide predictable, quiet, efficient movement.",
    benefits: [
      "High-capacity systems",
      "Fast response times",
      "Minimal downtime service",
      "Energy-efficient options",
      "Smart building integration",
    ],
    color: "commercial",
  },
  {
    id: "retail",
    name: "Shopping Malls & Retail",
    icon: ShoppingCart,
    description:
      "Retail environments require smooth, visible operation that enhances customer experience and keeps stores operational during peak hours.",
    benefits: [
      "Aesthetically designed cabins",
      "High-traffic capacity",
      "Escalator services",
      "Moving walkway solutions",
      "Scheduled maintenance",
    ],
    color: "retail",
  },
  {
    id: "hotels",
    name: "Hotels & Hospitality",
    icon: Armchair,
    description:
      "Guest experience is paramount. Our elevators provide seamless, quiet operation that guests expect from premium hospitality.",
    benefits: [
      "Premium cabin finishes",
      "Smooth, quiet operation",
      "Service elevator solutions",
      "Guest comfort optimization",
      "Rapid response service",
    ],
    color: "hotel",
  },
  {
    id: "residential",
    name: "Residential & Multi-Story",
    icon: Users,
    description:
      "From apartment complexes to high-rise residential towers, we design systems that provide dependable daily service for families and residents.",
    benefits: [
      "Residential-scale options",
      "Safety features",
      "Noise reduction",
      "Reliable daily operation",
      "Long-term maintenance plans",
    ],
    color: "residential",
  },
  {
    id: "education",
    name: "Universities & Institutions",
    icon: GraduationCap,
    description:
      "Educational institutions require dependable elevators for campus mobility. We provide solutions that handle student traffic while maintaining safety.",
    benefits: [
      "Multi-zone building support",
      "Safety compliance",
      "Predictable operation",
      "Student accessibility",
      "Preventive maintenance",
    ],
    color: "education",
  },
  {
    id: "airports",
    name: "Airports & Transportation",
    icon: Plane,
    description:
      "Travel hubs demand bulletproof reliability. Our systems handle continuous high-volume traffic with minimal interruption.",
    benefits: [
      "Continuous heavy-traffic operation",
      "Continuous monitoring",
      "High-capacity systems",
      "Rapid fault response",
      "Emergency protocols",
    ],
    color: "airport",
  },
  {
    id: "industrial",
    name: "Industrial & Warehouses",
    icon: Factory,
    description:
      "Manufacturing and logistics facilities require heavy-duty elevators and cargo systems that handle demanding operational requirements.",
    benefits: [
      "Heavy-load capacity",
      "Durable construction",
      "Industrial-grade parts",
      "Scheduled service",
      "Spare parts availability",
    ],
    color: "industrial",
  },
  {
    id: "government",
    name: "Government & Public",
    icon: Briefcase,
    description:
      "Public buildings must meet strict compliance standards. We ensure all systems are properly maintained and certified.",
    benefits: [
      "Full compliance",
      "Documentation & reporting",
      "Regular certification",
      "Professional service logs",
      "Accountability measures",
    ],
    color: "government",
  },
];

export default function Industries() {
  return (
    <section className="industries-section" aria-labelledby="industries-heading">
      <div className="industries-wrapper">
        {/* Section header */}
        <div className="section-head industries-head">
          <span className="section-number">04</span>
          <h2 id="industries-heading">
            Industries We <span>Serve</span>
          </h2>
          <p>
            From hospitals to airports, shopping malls to industrial facilities—FES provides specialized elevator
            solutions across Pakistan's most demanding sectors. Each vertical receives expertise tailored to its unique
            requirements.
          </p>
        </div>

        {/* Industries grid */}
        <div className="industries-grid">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            return (
              <div key={industry.id} className={`industry-card industry-${industry.color}`}>
                <div className="industry-icon">
                  <Icon size={28} />
                </div>
                <h3>{industry.name}</h3>
                <p className="industry-description">{industry.description}</p>

                <div className="industry-benefits">
                  <span className="benefits-label">Key benefits:</span>
                  <ul>
                    {industry.benefits.map((benefit) => (
                      <li key={benefit}>
                        <span className="check">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA section */}
        <div className="industries-cta">
          <h3>Your Sector Not Listed?</h3>
          <p>
            FES has experience across diverse vertical transportation requirements. Contact our team to discuss your
            specific industry needs.
          </p>
          <button className="button button-amber">
            Discuss your requirements →
          </button>
        </div>
      </div>
    </section>
  );
}
