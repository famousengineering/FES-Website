/**
 * FES Engineering AI Consultant — Executive Conversational Assistant
 * Powered by FES Vertical Transportation Engineering Knowledge Base
 */
import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  PhoneCall,
  Wrench,
  Building2,
  Zap,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export interface InquiryData {
  name?: string;
  phone?: string;
  email?: string;
  serviceType: string;
  buildingType?: string;
  floors?: string;
  requirement: string;
  urgency: "routine" | "urgent" | "emergency";
}

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  timestamp: number;
  chips?: string[];
  cta?: {
    type: "whatsapp" | "call" | "action";
    label: string;
    actionValue: string;
  };
}

interface QuickTopic {
  id: string;
  label: string;
  icon: typeof Wrench;
  query: string;
}

const QUICK_TOPICS: QuickTopic[] = [
  { id: "amc", label: "AMC & Maintenance", icon: Wrench, query: "Tell me about FES Maintenance & AMC plans" },
  { id: "installation", label: "New Elevator Specs", icon: Building2, query: "I need a quote for new elevator installation" },
  { id: "modernization", label: "Modernization / Upgrades", icon: Zap, query: "Can you modernize our existing old elevator?" },
  { id: "hospital", label: "Hospital Bed Lifts", icon: ShieldCheck, query: "Do you supply hospital bed and stretcher lifts?" },
  { id: "emergency", label: "Emergency Breakdown", icon: AlertTriangle, query: "URGENT: Elevator breakdown emergency support" },
];

function getEngineeringResponse(query: string, inquiryState: Partial<InquiryData>): { text: string; chips?: string[]; cta?: Message["cta"] } {
  const q = query.toLowerCase().trim();

  // 1. Emergency Breakdown
  if (
    q.includes("emergency") ||
    q.includes("breakdown") ||
    q.includes("stuck") ||
    q.includes("kharab") ||
    q.includes("band") ||
    q.includes("hazard") ||
    q.includes("urgent") ||
    q.includes("fas gaya")
  ) {
    return {
      text: `🚨 **EMERGENCY RAPID DISPATCH PROTOCOL ACTIVATED**\n\nFES emergency rapid response teams are on standby 24/7 across Lahore, Islamabad, Rawalpindi, Gujranwala, and nationwide client sites.\n\n• **Direct Hotline:** [0304-4943377](tel:+923044943377)\n• **SLA:** Immediate technician mobilization\n• **Safety Instructions:** Please ensure all passengers remain calm inside the cabin; do NOT attempt manual door forcing until trained FES technicians or rescue personnel arrive.`,
      chips: ["Call 0304-4943377 Now", "Dispatch via WhatsApp", "Main Menu"],
      cta: {
        type: "whatsapp",
        label: "Dispatch Emergency Team via WhatsApp",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("🚨 URGENT BREAKDOWN DISPATCH REQUEST: An elevator has malfunctioned. Please dispatch an emergency technical team immediately.")}`,
      },
    };
  }

  // 2. AMC / Preventive Maintenance
  if (
    q.includes("amc") ||
    q.includes("maintenance") ||
    q.includes("service plan") ||
    q.includes("monthly") ||
    q.includes("preventive")
  ) {
    return {
      text: `🔧 **FES Preventive Maintenance & AMC Program**\n\nFES currently protects **300+ units across 75+ landmark client sites** with a disciplined, proactive care model:\n\n• **Monthly Comprehensive Inspections:** Rigorous 48-point check covering traction machine, gearbox, brake assemblies, guide rails, door operators, and safety switches.\n• **Safety Testing:** Overspeed governor testing, safety gear clamp checks, and Automatic Rescue Device (ARD) battery health audits.\n• **Digital Logbook & Telemetry:** Transparent digital service reporting for facility directors.\n• **24/7 Emergency Support:** Guaranteed rapid turnaround on unexpected breakdowns.\n\nWould you like a customized AMC proposal or a free initial site safety audit for your building?`,
      chips: ["Get AMC Quote", "Free Site Survey", "Brands Supported", "Main Menu"],
      cta: {
        type: "whatsapp",
        label: "Request Customized AMC Proposal on WhatsApp",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("Hello FES, I would like to request an AMC / Preventive Maintenance proposal for our elevators.")}`,
      },
    };
  }

  // 3. New Installation
  if (
    q.includes("new elevator") ||
    q.includes("new installation") ||
    q.includes("install") ||
    q.includes("supply") ||
    q.includes("lagwani") ||
    q.includes("lagwana")
  ) {
    return {
      text: `🏗️ **FES Turnkey Elevator Supply & Installation**\n\nFrom shaft structural drawings to final safety commissioning, FES delivers European and international standard elevator systems:\n\n• **Passenger Elevators:** High-efficiency Machine-Room-Less (MRL) & Machine Room (MR) gearless traction systems (450 kg to 1600 kg, 1.0 m/s to 3.0 m/s).\n• **Panoramic / Observation Glass Lifts:** Custom circular or polygonal glass cabins with architectural shaft illumination.\n• **Home & Villa Lifts:** Compact, shallow-pit, single-phase 220V solutions designed for luxury private residences.\n• **Freight & Cargo Elevators:** Heavy-duty industrial cargo solutions up to 5000 kg.\n\nTo tailor your specifications: How many floors/stops does your building have, and what is its primary usage (Commercial, Residential, or Hospital)?`,
      chips: ["Commercial Building", "Hospital Bed Lift", "Residential Villa", "Book Site Survey"],
      cta: {
        type: "whatsapp",
        label: "Discuss New Installation with Senior Engineer",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("Hello FES, I would like to discuss supply and installation of a new elevator.")}`,
      },
    };
  }

  // 4. Modernization & Upgrades
  if (
    q.includes("moderniz") ||
    q.includes("upgrade") ||
    q.includes("purani") ||
    q.includes("replace") ||
    q.includes("controller") ||
    q.includes("vvvf") ||
    q.includes("jerk")
  ) {
    return {
      text: `⚡ **FES Elevator Modernization & Engineering Retrofits**\n\nIs your elevator experiencing frequent breakdowns, rough jerky stops, floor leveling inaccuracies, or high electricity bills? Complete replacement is often unnecessary!\n\n• **Microprocessor Controller Retrofit:** Replace obsolete relay logic with 32-bit digital intelligent controllers.\n• **VVVF Regenerative Drives:** Ultra-smooth acceleration/deceleration, pinpoint floor leveling, and **up to 35% power savings**.\n• **Permanent Magnet Gearless Machines (PMSM):** Quiet, oil-free, high-efficiency traction machines.\n• **Door Operator & LOP/COP Overhaul:** Modern infrared safety door curtains and touchscreen/LCD floor indicators.\n\nModernization costs **40–60% less** than full replacement while completely renewing building safety and reliability.`,
      chips: ["Schedule Modernization Survey", "Controller Upgrade Cost", "Main Menu"],
      cta: {
        type: "whatsapp",
        label: "Book Free Modernization Assessment",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("Hello FES, I want to book a technical inspection to modernize our existing elevators.")}`,
      },
    };
  }

  // 5. Hospital Bed / Stretcher Lifts
  if (
    q.includes("hospital") ||
    q.includes("bed") ||
    q.includes("stretcher") ||
    q.includes("medical") ||
    q.includes("inmol") ||
    q.includes("afic")
  ) {
    return {
      text: `🏥 **Hospital Bed & Stretcher Elevator Solutions**\n\nFES is a trusted vertical transportation partner for Pakistan's leading medical institutions (including **Armed Forces Institute of Cardiology AFIC Rawalpindi**, **INMOL Hospital Lahore**, and **Begum Akhtar Rukhsana Hospital**):\n\n• **Stretcher & Bed Compliance:** Deep cabins (1000 kg – 1600 kg / 13 to 21 passengers) accommodating modern hospital beds, IV poles, and medical personnel.\n• **Ultra-Smooth Medical Transit:** Zero-jerk deceleration curve protecting post-operative patients and delicate medical equipment.\n• **Automatic Rescue Device (ARD):** Guarantees cabin automatically levels at the nearest landing during municipal power cuts.\n• **Hospital Priority Dispatch:** Direct emergency doctor-key override for critical patient transit.`,
      chips: ["Hospital Lift Specs", "Book Hospital Site Survey", "Main Menu"],
      cta: {
        type: "whatsapp",
        label: "Connect with Hospital Elevator Specialist",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("Hello FES, I am inquiring about specialized Hospital Bed and Stretcher elevators.")}`,
      },
    };
  }

  // 6. Escalators & Moving Walkways
  if (
    q.includes("escalator") ||
    q.includes("moving walk") ||
    q.includes("travelator") ||
    q.includes("seeri")
  ) {
    return {
      text: `🚶 **Heavy-Duty Escalator & Moving Walkway Services**\n\nSpecialized engineering care for commercial shopping malls, transport terminals, and high-footfall public facilities:\n\n• **Preventive Maintenance:** Step chain ultrasonic inspection, automated lubrication, comb plate clearance calibration, and skirt deflector safety checks.\n• **Safety Compliance:** Handrail speed synchronization sensors, missing step detectors, and auxiliary emergency brakes.\n• **Supply & Overhaul:** Commercial incline 30°/35° escalators and 0°–12° horizontal moving travelators with VVVF smart eco-standby mode.`,
      chips: ["Escalator Maintenance", "Request Escalator Quote", "Main Menu"],
      cta: {
        type: "whatsapp",
        label: "Inquire about Escalator Solutions",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("Hello FES, I would like to inquire about Escalator & Moving Walkway services.")}`,
      },
    };
  }

  // 7. Brands Supported
  if (
    q.includes("brand") ||
    q.includes("hyundai") ||
    q.includes("otis") ||
    q.includes("mitsubishi") ||
    q.includes("kone") ||
    q.includes("schindler") ||
    q.includes("sigma") ||
    q.includes("fuji") ||
    q.includes("canny")
  ) {
    return {
      text: `🏢 **Comprehensive Multi-Brand Engineering Mastery**\n\nFES technical specialists are certified and experienced across leading global and imported brands:\n\n• **Hyundai Elevator** (Certified experience on landmark national projects)\n• **Xizi Otis / Otis**\n• **Sigma Elevator**\n• **Shanghai Mitsubishi / Mitsubishi Electric**\n• **Kone & Schindler**\n• **Fuji, Canny, Linvol, IFE** & custom European controllers (Monarch, STEP, BlueLight, Monarch NICE3000+).\n\nWe provide 100% genuine factory replacement parts and authorized diagnostic programming tools.`,
      chips: ["Inquire for my Brand", "Spare Parts Availability", "Main Menu"],
    };
  }

  // 8. Pricing / Rates / Quotation
  if (
    q.includes("price") ||
    q.includes("cost") ||
    q.includes("rate") ||
    q.includes("quotation") ||
    q.includes("quote") ||
    q.includes("kitna") ||
    q.includes("kitne") ||
    q.includes("charges") ||
    q.includes("estimate")
  ) {
    return {
      text: `💰 **Transparent, Building-Specific Pricing**\n\nElevator engineering investment depends on precise technical factors:\n\n1. **Service Type:** New Installation vs. Monthly AMC vs. Modernization Retrofit.\n2. **Building Height & Stops:** Number of landings (e.g. G+4, G+10) and travel height.\n3. **Capacity & Speed:** 6-person (450kg) vs 10-person (800kg) vs Hospital Bed (1600kg); 1.0 m/s up to 2.5 m/s.\n4. **Drive & Finish:** Machine-Room-Less (MRL) gearless vs Geared; Panoramic glass vs Hairline Stainless Steel.\n\nWould you like an immediate ballpark estimate or a free site survey by our senior engineer?`,
      chips: ["Book Free Site Survey", "Chat on WhatsApp for Pricing", "Main Menu"],
      cta: {
        type: "whatsapp",
        label: "Get Instant Official Quotation via WhatsApp",
        actionValue: `https://wa.me/923044943377?text=${encodeURIComponent("Hello FES, I would like to receive an official quotation for our building's elevator requirements.")}`,
      },
    };
  }

  // 9. Locations / Coverage
  if (
    q.includes("location") ||
    q.includes("city") ||
    q.includes("lahore") ||
    q.includes("islamabad") ||
    q.includes("rawalpindi") ||
    q.includes("gujranwala") ||
    q.includes("faisalabad") ||
    q.includes("office") ||
    q.includes("kahan")
  ) {
    return {
      text: `📍 **FES Regional Footprint & Service Hubs**\n\nFamous Engineering Services provides dedicated service engineering across Pakistan:\n\n• **Headquarters & Central Workshop:** Lahore, Punjab\n• **Regional Operations:** Islamabad & Rawalpindi\n• **Active Industrial & Commercial Hubs:** Gujranwala, Faisalabad, Chiniot, Sargodha & Karachi.\n• **Helpline & Emergency Dispatch:** 0304-4943377 / WhatsApp\n\nOur rapid mobile engineering units carry diagnostic kits and essential spare parts for rapid dispatch.`,
      chips: ["Book Site Visit", "Call Central Office", "Main Menu"],
    };
  }

  // 10. Company Credentials / Track Record
  if (
    q.includes("experience") ||
    q.includes("company") ||
    q.includes("track record") ||
    q.includes("client") ||
    q.includes("portfolio") ||
    q.includes("famous engineering") ||
    q.includes("since")
  ) {
    return {
      text: `🏆 **About Famous Engineering Services (FES)**\n\n• **Established:** January 2010 (**16+ years** of dedicated engineering precision).\n• **Active Units Under Care:** **300+ elevators and escalators**.\n• **Completed Service Records:** **8,485+ serviced units** & **36,780+ resolved maintenance calls**.\n• **Prestigious Projects:** Armed Forces Institute of Cardiology (AFIC), Air University, Bahria University, Giga City, MCB Center, INMOL Hospital, Al Hafeez Heights, Liberty Tower, Chiniot Power, and Gujranwala Business Center.\n• **Engineering Standard:** Rigorous compliance with EN-81 and international vertical transportation safety standards.`,
      chips: ["Our Work & Projects", "Contact Engineering Team", "Main Menu"],
    };
  }

  // Default / Intelligent Fallback
  return {
    text: `Hello! I have noted your inquiry regarding vertical transportation.\n\nAs FES' AI Engineering Consultant, I can assist you with:\n\n1. **New Elevator Specs & Design** (Passenger, Panoramic, Hospital Bed, Home Villa, Cargo)\n2. **Preventive Maintenance & AMC Contracts** (Tailored monthly visits + 24/7 breakdown SLA)\n3. **Elevator Modernization** (Controller retrofits, VVVF drives, PMSM gearless machines)\n4. **Escalators & Travelators**\n5. **Emergency Breakdown Assistance**\n\nHow can FES best support your building today?`,
    chips: ["New Elevator Specs", "AMC & Maintenance", "Modernization", "Emergency Breakdown", "Speak with Engineer"],
    cta: {
      type: "whatsapp",
      label: "Chat Directly with Senior Engineer on WhatsApp",
      actionValue: `https://wa.me/923044943377?text=${encodeURIComponent(`Hello FES, I was consulting with your AI assistant about: "${query}". Please assist me with further technical details.`)}`,
    },
  };
}

export default function AiConsultant({ onInquiry }: { onInquiry?: (data: InquiryData) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "👋 **Welcome to Famous Engineering Services (FES).**\n\nI am your **AI Vertical Transportation Consultant**. I can assist you with new elevator specifications, customized AMC maintenance programs, modernization retrofits, or immediate breakdown dispatch.\n\nWhat would you like to explore?",
      timestamp: Date.now(),
      chips: [
        "New Elevator Specs",
        "AMC & Maintenance",
        "Modernization Retrofit",
        "Hospital Bed Lifts",
        "Emergency Breakdown",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inquiryState, setInquiryState] = useState<Partial<InquiryData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      type: "user",
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Simulate real AI processing latency (450ms)
    setTimeout(() => {
      const resp = getEngineeringResponse(query, inquiryState);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        type: "bot",
        text: resp.text,
        timestamp: Date.now(),
        chips: resp.chips,
        cta: resp.cta,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (onInquiry) {
        onInquiry({
          serviceType: "ai_chat",
          requirement: query,
          urgency: query.toLowerCase().includes("emergency") ? "emergency" : "routine",
        });
      }
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        type: "bot",
        text: "Conversation refreshed. How can FES Vertical Transportation Engineering assist your building today?",
        timestamp: Date.now(),
        chips: [
          "New Elevator Specs",
          "AMC & Maintenance",
          "Modernization Retrofit",
          "Hospital Bed Lifts",
          "Emergency Breakdown",
        ],
      },
    ]);
  };

  return (
    <>
      {/* Executive Floating Toggle Launcher on the LEFT */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fes-ai-launcher"
          aria-label="Open FES Engineering AI Consultant"
          title="FES AI Vertical Transportation Consultant"
        >
          <div className="fes-ai-launcher-icon">
            <Bot size={20} strokeWidth={2.2} />
            <span className="fes-ai-live-beacon" />
          </div>
          <div className="fes-ai-launcher-text">
            <span className="fes-ai-launcher-badge">AI ADVISOR</span>
            <b>Ask FES Consultant</b>
          </div>
          <Sparkles size={14} className="fes-ai-sparkle" />
        </button>
      )}

      {/* Subtle Backdrop to close by clicking outside */}
      {isOpen && (
        <div
          className="fes-ai-backdrop"
          onClick={() => setIsOpen(false)}
          aria-label="Close Assistant overlay"
          title="Click to close assistant"
        />
      )}

      {/* Executive Glassmorphic Chat Window on the LEFT */}
      {isOpen && (
        <div className="fes-ai-window" role="dialog" aria-modal="true" aria-label="FES AI Elevator Consultant">
          {/* Header */}
          <div className="fes-ai-header">
            <div className="fes-ai-header-brand">
              <div className="fes-ai-avatar">
                <Bot size={20} />
                <span className="fes-ai-avatar-online" />
              </div>
              <div className="fes-ai-header-titles">
                <div className="fes-ai-header-row">
                  <h3>FES Engineering AI</h3>
                  <span className="fes-ai-verified-tag">OFFICIAL</span>
                </div>
                <p>24/7 Vertical Transportation Consultant</p>
              </div>
            </div>

            <div className="fes-ai-header-actions">
              <button
                onClick={handleReset}
                className="fes-ai-icon-btn"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="fes-ai-close-pill-btn"
                title="Close AI Assistant (Esc)"
                aria-label="Close AI Assistant"
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Quick Capability Bar */}
          <div className="fes-ai-topics-scroll">
            {QUICK_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSend(topic.query)}
                  className="fes-ai-topic-chip"
                >
                  <Icon size={13} className="text-amber" />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Thread */}
          <div className="fes-ai-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`fes-ai-msg-row fes-ai-msg-${msg.type}`}>
                {msg.type === "bot" && (
                  <div className="fes-ai-bot-avatar" aria-hidden="true">
                    <Bot size={14} />
                  </div>
                )}
                <div className="fes-ai-bubble-wrap">
                  <div className="fes-ai-bubble">
                    {msg.type === "bot" && (
                      <div className="fes-ai-bubble-tag">
                        <Sparkles size={11} /> FES ENGINEERING CONSULTANT
                      </div>
                    )}
                    <div className="fes-ai-text">
                      {msg.text.split("\n\n").map((para, i) => (
                        <p key={i}>
                          {para.split("\n").map((line, j) => {
                            // Basic bold formatter
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <span key={j} style={{ display: "block" }}>
                                {parts.map((part, k) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={k}>{part.slice(2, -2)}</strong>;
                                  }
                                  return part;
                                })}
                              </span>
                            );
                          })}
                        </p>
                      ))}
                    </div>

                    {/* Direct CTA button if present */}
                    {msg.cta && (
                      <div className="fes-ai-cta-box">
                        <a
                          href={msg.cta.actionValue}
                          target="_blank"
                          rel="noreferrer"
                          className="fes-ai-cta-button"
                        >
                          {msg.cta.type === "whatsapp" && (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm-3.53 4.14c-.19 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.06 3.29 5.09 4.49.72.29 1.28.46 1.72.6.72.23 1.38.2 1.9.12.58-.09 1.79-.73 2.05-1.44.25-.71.25-1.32.18-1.44-.07-.12-.27-.2-.56-.34-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01z"/>
                            </svg>
                          )}
                          <span>{msg.cta.label}</span>
                          <ChevronRight size={15} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contextual Suggestion Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="fes-ai-chips-list">
                      {msg.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (chip === "Main Menu") handleReset();
                            else if (chip.includes("Call")) window.open("tel:+923044943377", "_self");
                            else handleSend(chip);
                          }}
                          className="fes-ai-chip-pill"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="fes-ai-msg-row fes-ai-msg-bot">
                <div className="fes-ai-bot-avatar" aria-hidden="true">
                  <Bot size={14} />
                </div>
                <div className="fes-ai-bubble fes-ai-typing-bubble">
                  <span className="fes-ai-dot" />
                  <span className="fes-ai-dot" />
                  <span className="fes-ai-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Chat Input */}
          <div className="fes-ai-footer-input">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="fes-ai-input-form"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about elevator specs, AMC rates, emergency..."
                className="fes-ai-text-input"
                aria-label="Type your message"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="fes-ai-send-button"
                aria-label="Send inquiry"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="fes-ai-sub-footer">
              <span>FES Engineering Hotline: <a href="tel:+923044943377">0304-4943377</a></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
