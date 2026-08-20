import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabase } from "./database.js";
import { createForgeRepository } from "./repositories/forgeRepository.js";
import {
  authenticate,
  createSession,
  deleteSession,
  getSessionUser,
  seedUsers,
  sessionCookie,
} from "./auth.js";
import { assertStatePermissions } from "./middleware/permissions.js";

const port = Number(process.env.PORT || 3001);
const db = createDatabase();
seedUsers(db);
const repository = createForgeRepository(db);
const publicPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy(new Error("Request body too large"));
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function serveFrontend(request, response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(publicPath, `.${requestedPath}`);
  const safePath = filePath.startsWith(publicPath) ? filePath : path.join(publicPath, "index.html");
  const finalPath = fs.existsSync(safePath) ? safePath : path.join(publicPath, "index.html");
  if (!fs.existsSync(finalPath)) return sendJson(response, 404, { success: false, message: "Frontend build not found", errors: [] });
  const contentTypes = { ".css": "text/css", ".js": "text/javascript", ".html": "text/html", ".svg": "image/svg+xml", ".json": "application/json" };
  response.writeHead(200, { "Content-Type": contentTypes[path.extname(finalPath)] || "application/octet-stream" });
  response.end(fs.readFileSync(finalPath));
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const { username, password } = JSON.parse(await readBody(request));
      const user = authenticate(db, String(username || ""), String(password || ""));
      if (!user) return sendJson(response, 401, { success: false, message: "Invalid username or password", errors: [] });
      const session = createSession(db, user.id);
      return sendJson(response, 200, { user }, { "Set-Cookie": sessionCookie(session.token) });
    }
    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      const user = getSessionUser(db, request);
      return user ? sendJson(response, 200, { user }) : sendJson(response, 401, { success: false, message: "Authentication required", errors: [] });
    }
    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      deleteSession(db, request);
      return sendJson(response, 200, { success: true }, { "Set-Cookie": sessionCookie("", 0) });
    }
    if (request.method === "GET" && url.pathname === "/api/health") return sendJson(response, 200, { status: "healthy" });
    if (url.pathname === "/api/state") {
      const user = getSessionUser(db, request);
      if (!user) return sendJson(response, 401, { success: false, message: "Authentication required", errors: [] });
      if (request.method === "GET") return sendJson(response, 200, repository.getState());
      if (request.method === "PUT") {
        const state = JSON.parse(await readBody(request));
        assertStatePermissions(user, repository.getState(), state);
        return sendJson(response, 200, repository.saveState(state));
      }
    }
    if (request.method === "GET") return serveFrontend(request, response, url.pathname);
    sendJson(response, 404, { success: false, message: "Not found", errors: [] });
  } catch (error) {
    console.error(error);
    sendJson(response, error.statusCode || 400, { success: false, message: error.message, errors: [] });
  }
});

server.listen(port, () => console.log(`ForgeBoard API listening on port ${port}`));
process.on("SIGTERM", () => { db.close(); server.close(); });
process.on("SIGINT", () => { db.close(); server.close(); });
