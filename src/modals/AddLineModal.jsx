import { Check, X } from "lucide-react";

function AddLineModal({ onSubmit, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="eyebrow">New production line</p>
        <h2>Set a new target</h2>
        <label>
          Line name
          <input required name="name" placeholder="e.g. Assembly 05" />
        </label>
        <label>
          Part number
          <input required name="part" placeholder="e.g. AX-4407" />
        </label>
        <label>
          UPH target
          <input
            required
            name="target"
            type="number"
            min="1"
            placeholder="42"
          />
        </label>
        <button className="save-button" type="submit">
          <Check size={17} /> Add line
        </button>
      </form>
    </div>
  );
}

export default AddLineModal;
