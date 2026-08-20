async function request(url, options) {
  const response = await fetch(url, { credentials: "include", ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Authentication request failed");
  return body;
}

export function getSession() {
  return request("/api/auth/session");
}

export function login(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}
