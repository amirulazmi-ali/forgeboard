import crypto from "node:crypto";

export const SESSION_COOKIE = "forge_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const roles = new Set(["Admin", "Engineer", "Operator", "Viewer"]);

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function cookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

export function seedUsers(db) {
  const users = [
    ["admin", process.env.FORGEBOARD_ADMIN_PASSWORD || "admin123", "Admin", "ForgeBoard Admin"],
    ["engineer", process.env.FORGEBOARD_ENGINEER_PASSWORD || "engineer123", "Engineer", "ForgeBoard Engineer"],
    ["operator", process.env.FORGEBOARD_OPERATOR_PASSWORD || "operator123", "Operator", "ForgeBoard Operator"],
    ["viewer", process.env.FORGEBOARD_VIEWER_PASSWORD || "viewer123", "Viewer", "ForgeBoard Viewer"],
  ];
  const insert = db.prepare("INSERT OR IGNORE INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)");
  const seed = db.transaction(() => users.forEach(([username, password, role, displayName]) => insert.run(username, hashPassword(password), role, displayName)));
  seed();
}

export function authenticate(db, username, password) {
  const user = db.prepare("SELECT id, username, password_hash, role, display_name FROM users WHERE username = ?").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, username: user.username, role: user.role, displayName: user.display_name };
}

export function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash(token), userId, expiresAt);
  return { token, expiresAt };
}

export function getSessionUser(db, request) {
  const token = cookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const session = db.prepare("SELECT users.id, users.username, users.role, users.display_name, sessions.expires_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.id = ?").get(tokenHash(token));
  if (!session) return null;
  if (session.expires_at <= Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(tokenHash(token));
    return null;
  }
  return { id: session.id, username: session.username, role: session.role, displayName: session.display_name };
}

export function deleteSession(db, request) {
  const token = cookies(request)[SESSION_COOKIE];
  if (token) db.prepare("DELETE FROM sessions WHERE id = ?").run(tokenHash(token));
}

export function sessionCookie(token, maxAge = SESSION_TTL_MS / 1000) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

export function isRole(role) {
  return roles.has(role);
}
