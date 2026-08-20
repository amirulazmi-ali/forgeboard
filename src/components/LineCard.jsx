import { Gauge } from "lucide-react";

function LineCard({ line, current, targetLabel, selected, onOpen }) {
  const percentage = Math.min(100, Math.round((current / line.target) * 100));

  return (
    <button
      className={`line-card ${selected ? "chosen" : ""}`}
      onClick={() => onOpen?.(line.id)}
    >
      <div className="line-card-top">
        <span className={`line-icon ${line.color}`}>
          <Gauge size={18} />
        </span>
        <span
          className={`state ${line.status === "Running" ? "running" : "changeover"}`}
        >
          <span />
          {line.status}
        </span>
      </div>
      <div className="line-title">
        <strong>{line.name}</strong>
        <span>{line.id}</span>
      </div>
      <div className="line-part">
        Part <b>{line.part}</b>
        <span>
          {targetLabel} <b>{line.target} UPH</b>
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="line-footer">
        <span>
          <strong>{current}</strong> / {line.target} this hour
        </span>
        <span>{percentage}%</span>
      </div>
      <em>Tap to record</em>
    </button>
  );
}

export default LineCard;
