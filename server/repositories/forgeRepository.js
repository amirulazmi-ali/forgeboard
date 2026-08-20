const seedLines = [
  { id: "L-01", name: "Assembly 01", part: "AX-4407", target: 42, status: "Running", shift: "A", color: "mint" },
  { id: "L-02", name: "Assembly 02", part: "AX-4412", target: 36, status: "Running", shift: "A", color: "blue" },
  { id: "L-03", name: "Final Test", part: "FT-9018", target: 28, status: "Changeover", shift: "A", color: "amber" },
  { id: "L-04", name: "Pack-out", part: "PK-2204", target: 50, status: "Running", shift: "A", color: "coral" },
];
const seedOutput = {
  "L-01": [40, 44, 42, 38, 46, 41, 43, 39],
  "L-02": [34, 36, 33, 38, 35, 37, 31, 0],
  "L-03": [27, 29, 25, 0, 0, 0, 0, 0],
  "L-04": [49, 52, 48, 51, 50, 47, 53, 0],
};
const defaultCopy = {
  brand: "FORGEBOARD",
  overviewTitle: "Production overview",
  lineControl: "Line control",
  floorTitle: "Today on the floor",
  operatorNav: "Record output",
  engineerNav: "Engineer setup",
  adminNav: "Admin wording",
  recordTitle: "Record hourly output",
  recordHint: "Enter the total pieces made in each hour.",
  saveButton: "Save hour",
  targetLabel: "Target UPH",
  liveLabel: "Live floor data",
};

function seedDatabase(db) {
  if (db.prepare("SELECT COUNT(*) AS count FROM production_lines").get().count > 0) return;
  const insertLine = db.prepare("INSERT INTO production_lines (id, name, part, target_uph, status, shift, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertOutput = db.prepare("INSERT INTO hourly_output (line_id, hour, pieces) VALUES (?, ?, ?)");
  const insertSetting = db.prepare("INSERT INTO application_settings (key, value) VALUES (?, ?)");
  const seed = db.transaction(() => {
    for (const line of seedLines) insertLine.run(line.id, line.name, line.part, line.target, line.status, line.shift, line.color);
    for (const [lineId, hours] of Object.entries(seedOutput)) hours.forEach((pieces, hour) => insertOutput.run(lineId, hour, pieces));
    for (const [key, value] of Object.entries(defaultCopy)) insertSetting.run(key, value);
  });
  seed();
}

function readState(db) {
  const lines = db.prepare("SELECT id, name, part, target_uph AS target, status, shift, color FROM production_lines ORDER BY id").all();
  const output = Object.fromEntries(lines.map((line) => [line.id, Array(8).fill(0)]));
  for (const row of db.prepare("SELECT line_id, hour, pieces FROM hourly_output ORDER BY line_id, hour").all()) output[row.line_id][row.hour] = row.pieces;
  const copy = Object.fromEntries(db.prepare("SELECT key, value FROM application_settings").all().map((row) => [row.key, row.value]));
  return { lines, output, copy: { ...defaultCopy, ...copy } };
}

function validateState(state) {
  if (!state || !Array.isArray(state.lines) || !state.lines.length || !state.output || typeof state.output !== "object" || !state.copy || typeof state.copy !== "object") throw new Error("Invalid ForgeBoard state");
  for (const line of state.lines) {
    if (!line.id || !line.name || !line.part || !Number.isFinite(Number(line.target)) || Number(line.target) <= 0) throw new Error("Invalid production line");
    if (!Array.isArray(state.output[line.id]) || state.output[line.id].length !== 8) throw new Error("Invalid hourly output");
  }
}

export function createForgeRepository(db) {
  seedDatabase(db);
  return {
    getState() {
      return readState(db);
    },
    saveState(state) {
      validateState(state);
      const save = db.transaction(() => {
        db.prepare("DELETE FROM hourly_output").run();
        db.prepare("DELETE FROM production_lines").run();
        db.prepare("DELETE FROM application_settings").run();
        const insertLine = db.prepare("INSERT INTO production_lines (id, name, part, target_uph, status, shift, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
        const insertOutput = db.prepare("INSERT INTO hourly_output (line_id, hour, pieces) VALUES (?, ?, ?)");
        const insertSetting = db.prepare("INSERT INTO application_settings (key, value) VALUES (?, ?)");
        for (const line of state.lines) insertLine.run(line.id, line.name, line.part, Number(line.target), line.status, line.shift, line.color);
        for (const line of state.lines) state.output[line.id].forEach((pieces, hour) => insertOutput.run(line.id, hour, Math.max(0, Number(pieces) || 0)));
        for (const [key, value] of Object.entries(state.copy)) insertSetting.run(key, String(value));
      });
      save();
      return readState(db);
    },
  };
}
