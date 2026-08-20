import { useEffect, useState } from "react";
import { getSession, login as loginRequest, logout as logoutRequest } from "../services/authService";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((session) => setUser(session.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const session = await loginRequest(username, password);
    setUser(session.user);
    return session.user;
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return { user, loading, login, logout };
}

export default useAuth;
