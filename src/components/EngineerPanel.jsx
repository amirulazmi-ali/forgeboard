import { MonitorPlay, Plus, Trash2 } from "lucide-react";

function EngineerPanel({
  lines,
  onOpenRecord,
  canEditTargets,
  canManageLines,
  onAddLine,
  onTargetChange,
  onRemoveLine,
}) {
  return (
    <section className="engineer-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Configuration</p>
          <h2>UPH targets by line</h2>
        </div>
        <div className="panel-actions">
          {canManageLines && (
            <button className="primary-button" onClick={() => onOpenRecord("engineer")}>
              <MonitorPlay size={17} /> Open engineer entry
            </button>
          )}
          {canManageLines && (
            <button className="secondary-button" onClick={onAddLine}>
              <Plus size={17} /> Add line
            </button>
          )}
        </div>
      </div>
      <p className="panel-intro">
        Set the expected units per hour for each part number. Open engineer
        entry to review hourly output with target context.
      </p>
      <div className="target-table">
        <div className="table-head">
          <span>Line</span>
          <span>Part number</span>
          <span>Target UPH</span>
          <span>Status</span>
          <span />
        </div>
        {lines.map((line) => (
          <div className="table-row" key={line.id}>
            <div>
              <strong>{line.name}</strong>
              <small>{line.id}</small>
            </div>
            <div className="part-code">{line.part}</div>
            <div className="target-input">
              <input
                type="number"
                value={line.target}
                disabled={!canEditTargets}
                onChange={(event) =>
                  onTargetChange(line.id, event.target.value)
                }
              />
              <span>units/hr</span>
            </div>
            <div>
              <span
                className={`state ${line.status === "Running" ? "running" : "changeover"}`}
              >
                <span />
                {line.status}
              </span>
            </div>
            <button
              className="delete-button"
              title="Remove line"
              onClick={() => onRemoveLine(line.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EngineerPanel;
