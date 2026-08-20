import EngineerSetupPage from "./EngineerSetupPage";
import KPIHeader from "../components/KPIHeader";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import OverviewPage from "./OverviewPage";

function DashboardPage({
  copy,
  screen,
  user,
  canRecord,
  canEditTargets,
  canManageLines,
  canAdmin,
  popup,
  lines,
  output,
  boardNotes,
  selectedLine,
  totals,
  attainment,
  currentDateLabel,
  currentTimeLabel,
  onRecord,
  onAdmin,
  onLogout,
  onKiosk,
  onOpenLine,
  onAddLine,
  onTargetChange,
  onRemoveLine,
  onUpdateBoardHour,
  onUpdateBoardNote,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        copy={copy}
        user={user}
        popup={popup}
        canRecord={canRecord}
        onRecord={onRecord}
        canSetup={user.role === "Admin" || user.role === "Engineer"}
        canAdmin={user.role === "Admin"}
        onAdmin={onAdmin}
        onLogout={onLogout}
      />
      <main className="main-content">
        <Topbar
          copy={copy}
          screen={screen}
          canAdmin={canAdmin}
          currentDateLabel={currentDateLabel}
          onKiosk={onKiosk}
          onAdmin={onAdmin}
        />
        <KPIHeader
          totals={totals}
          attainment={attainment}
          currentTimeLabel={currentTimeLabel}
          activeLineCount={
            lines.filter((line) => line.status === "Running").length
          }
          lineCount={lines.length}
        />

        {screen === "overview" ? (
          <OverviewPage
            copy={copy}
            lines={lines}
            output={output}
            boardNotes={boardNotes}
            selectedLine={selectedLine}
            user={user}
            canRecord={canRecord}
            canEditTargets={canEditTargets}
            onRecord={onRecord}
            onOpenLine={onOpenLine}
            onUpdateBoardHour={onUpdateBoardHour}
            onUpdateBoardNote={onUpdateBoardNote}
          />
        ) : (
          <EngineerSetupPage
            lines={lines}
            onOpenRecord={onRecord}
            canEditTargets={canEditTargets}
            canManageLines={canManageLines}
            onAddLine={onAddLine}
            onTargetChange={onTargetChange}
            onRemoveLine={onRemoveLine}
          />
        )}
        <footer>
          <span>Forgeboard Operations OS</span>
          <span>Updated {currentTimeLabel} · Data stored locally</span>
        </footer>
      </main>
    </div>
  );
}

export default DashboardPage;
