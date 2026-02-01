import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Runs once on app load → checks if session cookie is valid
  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        // Expecting: { user: {...}, profile: {...} }
        setUser(res?.data?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      setUser(res?.data?.user ?? null);
      return res.data;
    } catch (error) {
      // Reset user state on login failure to ensure consistent state
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
