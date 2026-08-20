const rolePermissions = {
  Admin: new Set(["state:read", "output:write", "targets:write", "lines:manage", "settings:write"]),
  Engineer: new Set(["state:read", "targets:write"]),
  Operator: new Set(["state:read", "output:write"]),
  Viewer: new Set(["state:read"]),
};

export function hasPermission(user, permission) {
  return Boolean(user && rolePermissions[user.role]?.has(permission));
}

export function assertPermission(user, permission) {
  if (!hasPermission(user, permission)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function targetsOnlyChanged(current, next) {
  if (current.lines.length !== next.lines.length) return false;
  return current.lines.every((line, index) => {
    const candidate = next.lines[index];
    return candidate && line.id === candidate.id && line.name === candidate.name && line.part === candidate.part && line.status === candidate.status && line.shift === candidate.shift && line.color === candidate.color;
  });
}

export function requiredPermissionsForStateChange(current, next) {
  const required = new Set();
  if (!sameJson(current.output, next.output)) required.add("output:write");
  if (!sameJson(current.copy, next.copy)) required.add("settings:write");
  if (!sameJson(current.lines, next.lines)) required.add(targetsOnlyChanged(current, next) ? "targets:write" : "lines:manage");
  return required;
}

export function assertStatePermissions(user, current, next) {
  for (const permission of requiredPermissionsForStateChange(current, next)) assertPermission(user, permission);
}
