import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api, { formatApiError, setToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // No persisted token → user starts anonymous immediately.
  // Refreshing the tab requires re-login (in-memory token only).
  const [user, setUser] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e.response?.data?.detail) };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("[auth] logout request failed (clearing client state anyway):", err?.message);
    }
    setToken(null);
    setUser(false);
  }, []);

  // `loading` retained for API compatibility with consumers; always false with in-memory tokens.
  const value = useMemo(() => ({ user, loading: false, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
