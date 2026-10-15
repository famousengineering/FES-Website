import { useEffect, useState } from "react";

const START = new Date(2010, 0, 1).getTime(); // counting start
const SPLIT = new Date(2020, 0, 1).getTime(); // rate change date
const MS_DAY = 86400000;
const AVG_MONTH_DAYS = 30.44;

export function currentUnits(now: number): number {
  const phase1Days = (SPLIT - START) / MS_DAY;
  const phase1Units = phase1Days * (30 / AVG_MONTH_DAYS); // 2010–2020: 30 per month
  let phase2Units = 0;
  if (now > SPLIT) {
    phase2Units = ((now - SPLIT) / MS_DAY) * (60 / AVG_MONTH_DAYS); // 2020–now: 60 per month
  }
  return phase1Units + phase2Units;
}

export function currentComplaints(now: number): number {
  return Math.max(0, (now - START) / MS_DAY) * 6; // average of 5–7 per day
}

export default function ImpactCounter() {
  const [units, setUnits] = useState(0);
  const [complaints, setComplaints] = useState(0);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetUnits = Math.floor(currentUnits(Date.now()));
    const targetComplaints = Math.floor(currentComplaints(Date.now()));

    let intervalId: number | undefined;
    let animFrameId: number | undefined;

    const startLiveUpdates = () => {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        setUnits(Math.floor(currentUnits(now)));
        setComplaints(Math.floor(currentComplaints(now)));
      }, 1000);
    };

    if (reduced) {
      setUnits(targetUnits);
      setComplaints(targetComplaints);
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
      setUnits(Math.floor(eased * targetUnits));
      setComplaints(Math.floor(eased * targetComplaints));

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

  return (
    <section className="impact-counter" aria-label="Running service count since 2010">
      <div className="container">
        <div className="eyebrow" style={{ justifyContent: "center", color: "#BFD7EC", marginBottom: "28px" }}>
          <span className="dot" /> Since 2010 — Running Service Count
        </div>
        <div className="counter-grid reveal">
          <div className="counter-card">
            <div className="counter-live"><span className="live-dot" />LIVE</div>
            <div className="counter-num" id="counterUnits">{units.toLocaleString()}</div>
            <div className="counter-lbl">Elevators &amp; Escalators Serviced</div>
          </div>
          <div className="counter-card">
            <div className="counter-live"><span className="live-dot" />LIVE</div>
            <div className="counter-num" id="counterComplaints">{complaints.toLocaleString()}</div>
            <div className="counter-lbl">Customer Complaints Resolved</div>
          </div>
        </div>
        <p className="counter-note">Running count since January 2010, based on our average monthly and daily service volumes.</p>
      </div>
    </section>
  );
}
