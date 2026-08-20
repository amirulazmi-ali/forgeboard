export const seedLines = [
  { id: "L-01", name: "Assembly 01", part: "AX-4407", target: 42, status: "Running", shift: "A", color: "mint" },
  { id: "L-02", name: "Assembly 02", part: "AX-4412", target: 36, status: "Running", shift: "A", color: "blue" },
  { id: "L-03", name: "Final Test", part: "FT-9018", target: 28, status: "Changeover", shift: "A", color: "amber" },
  { id: "L-04", name: "Pack-out", part: "PK-2204", target: 50, status: "Running", shift: "A", color: "coral" },
];

export const seedOutput = {
  "L-01": [40, 44, 42, 38, 46, 41, 43, 39],
  "L-02": [34, 36, 33, 38, 35, 37, 31, 0],
  "L-03": [27, 29, 25, 0, 0, 0, 0, 0],
  "L-04": [49, 52, 48, 51, 50, 47, 53, 0],
};

export const defaultCopy = {
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

async function requestState(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Storage API request failed: ${response.status}`);
  return response.json();
}

export function fetchForgeState() {
  return requestState("/api/state");
}

export function saveForgeState(state) {
  return requestState("/api/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
}

export function isValidLines(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  const ids = new Set(value.map((line) => line?.id));
  return (
    ids.size === value.length &&
    value.every(
      (line) =>
        line?.id &&
        line?.name &&
        line?.part &&
        Number.isFinite(Number(line.target)) &&
        Number(line.target) > 0,
    )
  );
}

export function normalizeOutput(value, lines) {
  return Object.fromEntries(
    lines.map((line) => {
      const stored = value?.[line.id];
      const values = Array.isArray(stored) ? stored : seedOutput[line.id] || [];
      return [
        line.id,
        Array.from({ length: 8 }, (_, hour) =>
          Math.max(0, Number(values[hour]) || 0),
        ),
      ];
    }),
  );
}

export function nextLineId(lines) {
  let number = 1;
  while (
    lines.some((line) => line.id === `L-${String(number).padStart(2, "0")}`)
  )
    number += 1;
  return `L-${String(number).padStart(2, "0")}`;
}
