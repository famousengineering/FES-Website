/**
 * FES Corporate FAQ Section — Tier-1 Engineering & Vertical Transportation
 * Redesigned with compact professional spacing, category filtering, and smooth accordions
 */
import { ChevronDown, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  id: string;
  category: "Services" | "Emergency" | "Partners" | "Modernization" | "Coverage";
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "services-scope",
    category: "Services",
    categoryLabel: "Services & AMC",
    question: "What elevator and vertical transportation services does FES provide?",
    answer:
      "FES provides end-to-end vertical transportation engineering: new equipment supply & installation, planned preventive maintenance (PPM), rapid emergency breakdown support, full system modernization, genuine OEM spare parts supply, and commercial escalator & moving walk maintenance.",
  },
  {
    id: "amc-benefits",
    category: "Services",
    categoryLabel: "Services & AMC",
    question: "What does an Annual Maintenance Contract (AMC) include?",
    answer:
      "An FES AMC includes scheduled monthly preventive inspections (conducted once a month or customized to client operational demands), lubrication, safety circuit testing, brake and door adjustments, detailed digital site logs, priority breakdown call-outs, and discounted replacement components to maximize uptime and passenger safety.",
  },
  {
    id: "emergency-response",
    category: "Emergency",
    categoryLabel: "Emergency Support",
    question: "How does FES handle urgent elevator breakdowns and emergencies?",
    answer:
      "We operate dedicated emergency dispatch teams across Rawalpindi, Islamabad, and Lahore. In major urban centers, our average on-site technician arrival time is 45 to 60 minutes. Direct priority hotline: 0304-4943377 and instant WhatsApp support are monitored continuously.",
  },
  {
    id: "service-frequency",
    category: "Services",
    categoryLabel: "Services & AMC",
    question: "How frequently should passenger elevators be serviced under an FES contract?",
    answer:
      "Standard routine maintenance is conducted monthly (once a month), or scheduled according to the client's operational demand and building traffic volume. For high-demand facilities or hospitals, custom frequencies are arranged per client specification.",
  },
  {
    id: "partners-blt",
    category: "Partners",
    categoryLabel: "Partners & Brands",
    question: "Which elevator manufacturers does FES represent and service?",
    answer:
      "FES is an authorized representative for BLT Brand Elevators (Shenyang Yuanda Intellectual Industry Group Co., Ltd., China). We also maintain extensive multi-brand service capability for Hyundai Elevator, Shanghai Mitsubishi, Sigma, Linvol, and other major international systems using genuine OEM parts.",
  },
  {
    id: "modernization-scope",
    category: "Modernization",
    categoryLabel: "Modernization",
    question: "Can FES modernize an aging elevator without replacing the whole shaft?",
    answer:
      "Yes. In most cases, full replacement is unnecessary. We specialize in targeted modernizations: VVVF drive upgrades, microprocessor controllers, door operator replacements, infrared curtain safety edges, and cabin aesthetic renovations. This typically extends system life by 15-20 years at a fraction of new shaft installation costs.",
  },
  {
    id: "coverage-areas",
    category: "Coverage",
    categoryLabel: "Coverage",
    question: "What geographic locations does FES cover across Pakistan?",
    answer:
      "FES operates permanent regional offices in Rawalpindi (Rawal Mall), Islamabad (G-10 Markaz), and Lahore (Aashiana Center, Liberty), with active field service teams deployed across the Punjab and ICT regions.",
  },
  {
    id: "escalator-care",
    category: "Services",
    categoryLabel: "Services & AMC",
    question: "Does FES service commercial escalators and moving walkways?",
    answer:
      "Yes. Our escalator division specializes in commercial escalators, airport autowalks, and shopping mall moving walkways, including comb plate safety alignment, step chain tensioning, handrail drive servicing, and safety compliance audits.",
  },
  {
    id: "survey-quote",
    category: "Services",
    categoryLabel: "Services & AMC",
    question: "How do I book a site assessment or request a formal quotation from FES?",
    answer:
      "You can submit an inquiry through our online assessment console below, call us at 0304-4943377, or send building details via WhatsApp. Our senior technical team conducts on-site surveys and delivers comprehensive technical proposals within 24 to 48 hours.",
  },
];

type CategoryFilter = "All" | "Services" | "Emergency" | "Partners" | "Modernization" | "Coverage";

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [openId, setOpenId] = useState<string | null>("services-scope");

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: "All Questions", value: "All" },
    { label: "Services & AMC", value: "Services" },
    { label: "Emergency Support", value: "Emergency" },
    { label: "Partners & Brands", value: "Partners" },
    { label: "Modernization", value: "Modernization" },
    { label: "Coverage", value: "Coverage" },
  ];

  const filteredFaqs =
    activeCategory === "All"
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="faq-wrapper">
        {/* Header */}
        <div className="faq-header">
          <p className="eyebrow"><span />Knowledge Base & Support</p>
          <h2 id="faq-heading">Frequently Asked Questions</h2>
          <p className="faq-subhead">
            Clear, technical answers to common questions regarding elevator maintenance contracts, emergency breakdown protocols, modernization, and manufacturer partnerships.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="faq-filter-bar" role="tablist" aria-label="FAQ Categories">
          {categories.map((cat) => (
            <button
              key={cat.value}
              role="tab"
              aria-selected={activeCategory === cat.value}
              className={`faq-pill ${activeCategory === cat.value ? "is-active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
              {cat.value === "All" ? ` (${FAQS.length})` : ""}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List - Professional Compact Spacing */}
        <div className="faq-list">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <article key={faq.id} className={`faq-card ${isOpen ? "is-open" : ""}`}>
                <button
                  className="faq-question-btn"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="faq-q-left">
                    <span className="faq-tag">{faq.categoryLabel}</span>
                    <span className="faq-q-text">{faq.question}</span>
                  </div>
                  <span className={`faq-chevron-wrap ${isOpen ? "rotated" : ""}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>
                {isOpen && (
                  <div id={`faq-answer-${faq.id}`} className="faq-body">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Professional Support Banner */}
        <div className="faq-support-box">
          <div className="faq-support-text">
            <h3>Have a specific building or equipment inquiry?</h3>
            <p>Our senior vertical transportation engineers are available for site inspections and technical consultations.</p>
          </div>
          <div className="faq-support-actions">
            <a href="tel:+923044943377" className="button button-small button-amber">
              <Phone size={14} /> Call 0304 4943377
            </a>
            <a href="https://wa.me/923044943377" target="_blank" rel="noreferrer" className="button button-small faq-wa-btn">
              <MessageSquare size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
