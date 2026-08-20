import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AddLineModal from "./modals/AddLineModal";
import AdminModal from "./modals/AdminModal";
import RecordModal from "./modals/RecordModal";
import DashboardPage from "./pages/DashboardPage";
import KioskPage from "./pages/KioskPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuth from "./hooks/useAuth";
import useForgeStorage from "./hooks/useForgeStorage";
import { nextLineId } from "./services/storageService";

function ForgeboardApp({ user, onLogout }) {
  const { lines, setLines, output, setOutput, copy, setCopy } =
    useForgeStorage();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState("L-01");
  const [boardNotes, setBoardNotes] = useState({});
  const [popup, setPopup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const screen = location.pathname === "/setup" ? "setup" : "overview";
  const canRecord = user.role === "Admin" || user.role === "Operator";
  const canEditTargets = user.role === "Admin" || user.role === "Engineer";
  const canManageLines = user.role === "Admin";
  const canAdmin = user.role === "Admin";

  useEffect(() => {
    if (
      location.pathname === "/" &&
      new URLSearchParams(location.search).get("kiosk") === "1"
    ) {
      navigate("/kiosk", { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  const activeLine = lines.find((line) => line.id === selectedLine) || lines[0];
  const totals = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + output[line.id].reduce((a, b) => a + b, 0),
        0,
      ),
    [lines, output],
  );
  const targetTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.target * 8, 0),
    [lines],
  );
  const attainment = Math.round((totals / targetTotal) * 100);
  const activeOutput = output[activeLine.id];
  const currentTime = new Date();
  const currentDateLabel = currentTime.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentTimeLabel = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  function updateHour(hour, value) {
    const lineId = lines.some((line) => line.id === selectedLine)
      ? selectedLine
      : activeLine.id;
    const next = [...(output[lineId] || Array(8).fill(0))];
    next[hour] = Math.max(0, Number(value) || 0);
    setOutput({ ...output, [lineId]: next });
  }

  function updateBoardHour(hour, value, field) {
    if (field === "actual") updateHour(hour, value);
    if (field === "plan") {
      setLines(
        lines.map((line) =>
          line.id === selectedLine
            ? { ...line, target: Math.max(1, Number(value) || 1) }
            : line,
        ),
      );
    }
  }

  function updateBoardNote(hour, field, value) {
    const lineNotes = boardNotes[selectedLine] || {};
    setBoardNotes({
      ...boardNotes,
      [selectedLine]: {
        ...lineNotes,
        [hour]: { ...(lineNotes[hour] || {}), [field]: value },
      },
    });
  }

  function addLine(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const part = String(form.get("part") || "").trim();
    const target = Number(form.get("target"));
    if (!name || !part || !Number.isFinite(target) || target <= 0) return;
    const line = {
      id: nextLineId(lines),
      name,
      part,
      target,
      status: "Running",
      shift: "A",
      color: "mint",
    };
    setLines([...lines, line]);
    setOutput({ ...output, [line.id]: Array(8).fill(0) });
    setSelectedLine(line.id);
    setShowForm(false);
    event.currentTarget.reset();
  }

  function removeLine(id) {
    if (lines.length === 1) return;
    const nextLines = lines.filter((line) => line.id !== id);
    const nextOutput = { ...output };
    delete nextOutput[id];
    setLines(nextLines);
    setOutput(nextOutput);
    setSelectedLine(nextLines[0].id);
  }

  function openRecord(lineId = selectedLine, role = "operator") {
    setSelectedLine(lineId);
    setPopup(role);
  }

  function updateCopy(key, value) {
    setCopy({ ...copy, [key]: value });
  }

  function enterKiosk() {
    navigate("/kiosk");
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  function exitKiosk() {
    navigate("/");
    document.exitFullscreen?.().catch(() => {});
  }

  const dashboard = (
    <>
      <DashboardPage
        copy={copy}
        screen={screen}
        user={user}
        canRecord={canRecord}
        canEditTargets={canEditTargets}
        canManageLines={canManageLines}
        canAdmin={canAdmin}
        popup={popup}
        lines={lines}
        output={output}
        boardNotes={boardNotes[selectedLine] || {}}
        selectedLine={selectedLine}
        totals={totals}
        attainment={attainment}
        currentDateLabel={currentDateLabel}
        currentTimeLabel={currentTimeLabel}
        onRecord={(role) => openRecord(selectedLine, role || "operator")}
        onAdmin={() => canAdmin && setPopup("admin")}
        onLogout={onLogout}
        onKiosk={enterKiosk}
        onOpenLine={(lineId) => openRecord(lineId)}
        onAddLine={() => setShowForm(true)}
        onTargetChange={(lineId, value) =>
          setLines(
            lines.map((item) =>
              item.id === lineId
                ? { ...item, target: Math.max(1, Number(value) || 1) }
                : item,
            ),
          )
        }
        onRemoveLine={removeLine}
        onUpdateBoardHour={updateBoardHour}
        onUpdateBoardNote={updateBoardNote}
      />
      {popup === "admin" && (
          <AdminModal
          copy={copy}
          onChange={updateCopy}
          onClose={() => setPopup(null)}
        />
      )}
      {popup && popup !== "admin" && (
          <RecordModal
          popup={popup}
          copy={copy}
          lines={lines}
          selectedLine={selectedLine}
          activeLine={activeLine}
          activeOutput={activeOutput}
          currentTimeLabel={currentTimeLabel}
          onSelectLine={(event) => setSelectedLine(event.target.value)}
          onUpdateHour={updateHour}
          onClose={() => setPopup(null)}
        />
      )}
      {showForm && (
        <AddLineModal onSubmit={addLine} onClose={() => setShowForm(false)} />
      )}
    </>
  );

  return (
    <Routes>
      <Route path="/" element={dashboard} />
      <Route
        path="/setup"
        element={
          <ProtectedRoute user={user} allowedRoles={["Admin", "Engineer"]}>
            {dashboard}
          </ProtectedRoute>
        }
      />
      <Route
        path="/kiosk"
        element={
          <ProtectedRoute user={user}>
            <KioskPage
              copy={copy}
              line={activeLine}
              activeOutput={activeOutput}
              boardNotes={boardNotes[selectedLine] || {}}
              currentTimeLabel={currentTimeLabel}
              onExit={exitKiosk}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AuthGate() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return null;
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  return <ForgeboardApp user={user} onLogout={logout} />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthGate />
    </BrowserRouter>
  );
}

export default App;
