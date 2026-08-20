import { Check, X } from "lucide-react";

function RecordModal({
  popup,
  copy,
  lines,
  selectedLine,
  activeLine,
  activeOutput,
  currentTimeLabel,
  onSelectLine,
  onUpdateHour,
  onClose,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal record-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">
          {popup === "engineer" ? "Engineer entry" : "Operator entry"}
        </p>
        <h2>{copy.recordTitle}</h2>
        <p className="modal-intro">{copy.recordHint}</p>
        <div className="record-line-select">
          <span>Production line</span>
          <select value={selectedLine} onChange={onSelectLine}>
            {lines.map((line) => (
              <option value={line.id} key={line.id}>
                {line.name} · {line.part}
              </option>
            ))}
          </select>
        </div>
        <div className="record-current">
          <div>
            <span>Current time</span>
            <strong>{currentTimeLabel}</strong>
          </div>
          <label>
            Pieces made
            <input
              type="number"
              min="0"
              value={activeOutput[7]}
              onChange={(event) => onUpdateHour(7, event.target.value)}
            />
          </label>
          <div>
            <span>{copy.targetLabel}</span>
            <strong>
              {activeLine.target} <small>UPH</small>
            </strong>
          </div>
        </div>
        <div className="quick-keypad">
          {[0, 1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              onClick={() =>
                onUpdateHour(7, Number(activeOutput[7]) + number * 5)
              }
            >
              {number * 5}
            </button>
          ))}
        </div>
        <button className="save-button" onClick={onClose}>
          <Check size={17} /> {copy.saveButton}
        </button>
      </div>
    </div>
  );
}

export default RecordModal;
