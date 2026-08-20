import { Factory, Maximize2 } from "lucide-react";
import ProductionBoard from "../components/ProductionBoard";

function KioskPage({
  copy,
  line,
  activeOutput,
  boardNotes,
  currentTimeLabel,
  onExit,
}) {
  return (
    <div className="kiosk-shell">
      <header className="kiosk-header">
        <div className="kiosk-brand">
          <span className="brand-mark">
            <Factory size={22} />
          </span>
          <strong>{copy.brand}</strong>
          <span className="kiosk-divider" /> <span>Plant 04 · Shift A</span>
        </div>
        <div className="kiosk-live">
          <span className="pulse" /> {copy.liveLabel}{" "}
          <button
            className="kiosk-exit"
            onClick={onExit}
            title="Exit kiosk display"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </header>
      <ProductionBoard
        line={line}
        output={activeOutput}
        boardNotes={boardNotes}
        user={{ role: "Viewer" }}
        canRecord={false}
        canEditTargets={false}
        onUpdateHour={() => {}}
        onUpdateNote={() => {}}
      />
      <footer>
        <span>{copy.brand} · {line.id} · Read-only display</span>
        <span>Updated {currentTimeLabel} · Press the top-right icon to exit</span>
      </footer>
    </div>
  );
}

export default KioskPage;
