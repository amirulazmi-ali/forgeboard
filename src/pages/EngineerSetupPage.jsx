import EngineerPanel from "../components/EngineerPanel";

function EngineerSetupPage({ lines, onOpenRecord, onAddLine, onTargetChange, onRemoveLine }) {
  return (
    <EngineerPanel
      lines={lines}
      onOpenRecord={onOpenRecord}
      onAddLine={onAddLine}
      onTargetChange={onTargetChange}
      onRemoveLine={onRemoveLine}
    />
  );
}

export default EngineerSetupPage;
