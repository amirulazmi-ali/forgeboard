import { ClipboardPenLine, Save } from "lucide-react";

const HOURS = [
  "07:00–08:00",
  "08:00–09:00",
  "09:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "12:00–13:00",
  "13:00–14:00",
  "14:00–15:00",
];

function EditableCell({ value, disabled, onChange, type = "text" }) {
  if (disabled) return <span className="board-value">{value || "—"}</span>;

  return (
    <input
      className="board-input"
      type={type}
      min={type === "number" ? 0 : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function ProductionBoard({
  line,
  output,
  boardNotes,
  user,
  canRecord,
  canEditTargets,
  onUpdateHour,
  onUpdateNote,
  onRecord,
}) {
  const isAdmin = user.role === "Admin";
  const canEditPlan = canEditTargets || isAdmin;
  const canEditActual = canRecord || isAdmin;
  const plan = line.target;
  const totalActual = output.reduce((sum, value) => sum + Number(value || 0), 0);
  const totalPlan = plan * output.length;
  const totalDelta = totalActual - totalPlan;
  const totalYield = totalPlan ? Math.round((totalActual / totalPlan) * 100) : 0;

  return (
    <section className="production-board">
      <div className="board-toolbar">
        <div>
          <p className="eyebrow">Operator production record</p>
          <h2>{line.name}</h2>
        </div>
        <div className="board-actions">
          <span className="board-status"><span /> Live board</span>
          {canRecord && (
            <button className="primary-button" onClick={onRecord}>
              <ClipboardPenLine size={16} /> Record current hour
            </button>
          )}
        </div>
      </div>

      <div className="board-meta">
        <div><span>Date</span><strong>{new Date().toLocaleDateString("en-GB")}</strong></div>
        <div><span>Model / part</span><strong>{line.part}</strong></div>
        <div><span>Line</span><strong>{line.id} · {line.name}</strong></div>
        <div><span>Shift</span><strong>{line.shift}</strong></div>
        <div><span>UPH</span><strong>{line.target}</strong></div>
        <div><span>Status</span><strong className="board-running">{line.status}</strong></div>
      </div>

      <div className="board-scroll">
        <table className="production-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Plan</th>
              <th>Actual</th>
              <th>Delta</th>
              <th>Yield</th>
              <th>Downtime</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour, index) => {
              const actual = Number(output[index] || 0);
              const delta = actual - plan;
              const yieldValue = plan ? Math.round((actual / plan) * 100) : 0;
              const note = boardNotes[index] || { downtime: "", remarks: "" };
              return (
                <tr key={hour}>
                  <th>{hour}</th>
                  <td><EditableCell value={plan} disabled={!canEditPlan} type="number" onChange={(value) => onUpdateHour(index, value, "plan")} /></td>
                  <td><EditableCell value={actual} disabled={!canEditActual} type="number" onChange={(value) => onUpdateHour(index, value, "actual")} /></td>
                  <td className={delta < 0 ? "board-negative" : "board-positive"}>{delta > 0 ? `+${delta}` : delta}</td>
                  <td className={yieldValue >= 100 ? "board-positive" : yieldValue ? "board-negative" : ""}>{yieldValue}%</td>
                  <td><EditableCell value={note.downtime} disabled={!canEditActual} onChange={(value) => onUpdateNote(index, "downtime", value)} /></td>
                  <td><EditableCell value={note.remarks} disabled={!canEditActual} onChange={(value) => onUpdateNote(index, "remarks", value)} /></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th>{totalPlan}</th>
              <th>{totalActual}</th>
              <th className={totalDelta < 0 ? "board-negative" : "board-positive"}>{totalDelta > 0 ? `+${totalDelta}` : totalDelta}</th>
              <th className={totalYield >= 100 ? "board-positive" : "board-negative"}>{totalYield}%</th>
              <th colSpan="2"><Save size={14} /> Changes save automatically</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default ProductionBoard;
