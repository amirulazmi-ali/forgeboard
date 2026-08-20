import ProductionBoard from "../components/ProductionBoard";

function OverviewPage({
  lines,
  output,
  selectedLine,
  boardNotes,
  user,
  canRecord,
  canEditTargets,
  onRecord,
  onUpdateBoardHour,
  onUpdateBoardNote,
}) {
  const line = lines.find((item) => item.id === selectedLine) || lines[0];

  return (
    <ProductionBoard
      line={line}
      output={output[line.id] || []}
      boardNotes={boardNotes}
      user={user}
      canRecord={canRecord}
      canEditTargets={canEditTargets}
      onRecord={onRecord}
      onUpdateHour={onUpdateBoardHour}
      onUpdateNote={onUpdateBoardNote}
    />
  );
}

export default OverviewPage;
