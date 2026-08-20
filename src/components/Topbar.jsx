import { Maximize2, Wrench } from "lucide-react";

function Topbar({ copy, screen, canAdmin, currentDateLabel, onKiosk, onAdmin }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{currentDateLabel} · Shift A</p>
        <h1>{screen === "overview" ? copy.overviewTitle : copy.engineerNav}</h1>
      </div>
      <div className="top-actions">
        <div className="live-pill">
          <span className="pulse" /> {copy.liveLabel}
        </div>
        {screen === "overview" && (
          <button className="kiosk-button" onClick={onKiosk}>
            <Maximize2 size={16} /> TV display
          </button>
        )}
        {canAdmin && (
          <button className="icon-button" title="Admin wording" onClick={onAdmin}>
            <Wrench size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Topbar;
