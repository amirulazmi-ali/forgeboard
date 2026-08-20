import { Activity } from "lucide-react";

function KPIHeader({
  totals,
  attainment,
  currentTimeLabel,
  activeLineCount,
  lineCount,
}) {
  return (
    <section className="hero-strip">
      <div>
        <p className="eyebrow light">Current shift performance</p>
        <div className="hero-number">
          {totals.toLocaleString()} <span>units</span>
        </div>
        <p className="hero-caption">
          <Activity size={15} /> Live local production data
        </p>
      </div>
      <div className="hero-ring">
        <div>
          <strong>{attainment}%</strong>
          <span>attainment</span>
        </div>
      </div>
      <div className="hero-meta">
        <div>
          <span>Current time</span>
          <strong>{currentTimeLabel}</strong>
        </div>
        <div>
          <span>Active lines</span>
          <strong>
            {activeLineCount}
            <small> / {lineCount}</small>
          </strong>
        </div>
      </div>
    </section>
  );
}

export default KPIHeader;
