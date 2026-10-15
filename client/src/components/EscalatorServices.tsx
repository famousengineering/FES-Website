/**
 * Escalator Services — Specialized moving transportation solutions
 */
import { AlertCircle, Zap, Wrench, Shield } from "lucide-react";

export default function EscalatorServices() {
  return (
    <section className="escalator-section" aria-labelledby="escalator-heading">
      <div className="escalator-wrapper">
        {/* Header */}
        <div className="escalator-header">
          <div className="section-head escalator-head">
            <span className="section-number">05</span>
            <h2 id="escalator-heading">Escalator & Moving Systems</h2>
            <p>
              Beyond elevators, FES maintains complete escalator and moving walkway ecosystems. High-traffic retail,
              transit and hospitality environments depend on our specialized expertise.
            </p>
          </div>
        </div>

        {/* Services grid */}
        <div className="escalator-services">
          {/* Service 1 */}
          <div className="escalator-service">
            <div className="service-icon service-icon-install">
              <Zap size={32} />
            </div>
            <h3>Installation & Commissioning</h3>
            <p>
              Complete installation of escalators and moving walkways, from site assessment through factory testing to
              final commissioning. Full compliance with all safety standards.
            </p>
            <ul className="service-details">
              <li>On-site measurement & design</li>
              <li>Foundation work</li>
              <li>System integration</li>
              <li>Safety testing & certification</li>
              <li>Operator training</li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className="escalator-service">
            <div className="service-icon service-icon-maint">
              <Wrench size={32} />
            </div>
            <h3>Maintenance & Repair</h3>
            <p>
              Preventive maintenance programs designed to keep escalators running smoothly during peak hours. Rapid
              response breakdown service ready when needed.
            </p>
            <ul className="service-details">
              <li>Monthly preventive visits (or per client schedule)</li>
              <li>Emergency breakdown service</li>
              <li>Component inspection</li>
              <li>Lubrication & adjustment</li>
              <li>Performance optimization</li>
            </ul>
          </div>

          {/* Service 3 */}
          <div className="escalator-service">
            <div className="service-icon service-icon-mod">
              <Shield size={32} />
            </div>
            <h3>Modernization & Upgrades</h3>
            <p>
              Renew aging escalators with updated safety systems, energy-efficient drives, and enhanced reliability
              without major structural changes.
            </p>
            <ul className="service-details">
              <li>Drive & motor upgrades</li>
              <li>Controller replacement</li>
              <li>Safety system modernization</li>
              <li>Energy efficiency improvements</li>
              <li>Cosmetic refinishing</li>
            </ul>
          </div>
        </div>

        {/* Technical specifications */}
        <div className="escalator-specs">
          <h3>Escalator Expertise</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-icon">📊</span>
              <h4>Capacity Analysis</h4>
              <p>Proper escalator sizing for peak-hour traffic in malls, transit stations and airports</p>
            </div>
            <div className="spec-item">
              <span className="spec-icon">⚙️</span>
              <h4>Technical Service</h4>
              <p>Trained technicians with expertise in all major escalator manufacturers and systems</p>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🔧</span>
              <h4>Parts Supply</h4>
              <p>Genuine spare parts and quick-swap components to minimize downtime during repairs</p>
            </div>
            <div className="spec-item">
              <span className="spec-icon">📋</span>
              <h4>Compliance & Records</h4>
              <p>Complete maintenance documentation and safety certification records for inspection purposes</p>
            </div>
          </div>
        </div>

        {/* Why choose FES for escalators */}
        <div className="escalator-why">
          <h3>Why Choose FES for Escalator Services?</h3>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">1</div>
              <h4>Specialized Knowledge</h4>
              <p>
                Escalators operate differently than elevators. Our technicians understand the unique mechanical and
                safety requirements specific to moving systems.
              </p>
            </div>
            <div className="why-item">
              <div className="why-icon">2</div>
              <h4>Reliability in High-Traffic</h4>
              <p>
                Shopping malls and transit stations can't afford downtime. Our preventive programs ensure escalators
                operate smoothly during peak hours.
              </p>
            </div>
            <div className="why-item">
              <div className="why-icon">3</div>
              <h4>Safety Compliance</h4>
              <p>
                Escalators require regular safety inspections. We maintain all required certifications and provide
                complete audit documentation.
              </p>
            </div>
            <div className="why-item">
              <div className="why-icon">4</div>
              <h4>Cost Efficiency</h4>
              <p>
                Regular maintenance prevents expensive emergency repairs. Our AMC programs are designed to maximize
                uptime while optimizing costs.
              </p>
            </div>
          </div>
        </div>

        {/* Safety callout */}
        <div className="escalator-safety">
          <div className="safety-icon">
            <AlertCircle size={24} />
          </div>
          <h4>Safety is Priority</h4>
          <p>
            Escalators with defective safety devices pose serious injury risks. Regular inspection and prompt repair of
            safety systems is not optional—it's essential. FES ensures every escalator in our care meets all safety
            standards.
          </p>
        </div>
      </div>
    </section>
  );
}
