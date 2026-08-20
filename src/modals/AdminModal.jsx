import { Save, X } from "lucide-react";

const copyLabels = {
  brand: "Brand name",
  overviewTitle: "Overview title",
  lineControl: "Section label",
  floorTitle: "Floor heading",
  operatorNav: "Operator button",
  engineerNav: "Engineer button",
  adminNav: "Admin button",
  recordTitle: "Recording title",
  recordHint: "Recording helper text",
  saveButton: "Save button",
  targetLabel: "Target label",
  liveLabel: "Live status label",
};

function AdminModal({ copy, onChange, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal admin-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">Administrator</p>
        <h2>Customize page wording</h2>
        <p className="modal-intro">
          Change the labels operators and supervisors see. Updates are saved on
          this device.
        </p>
        <div className="copy-fields">
          {Object.entries(copyLabels).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={copy[key]}
                onChange={(event) => onChange(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <button className="save-button" onClick={onClose}>
          <Save size={17} /> Save wording
        </button>
      </div>
    </div>
  );
}

export default AdminModal;
