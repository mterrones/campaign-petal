import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getJson, getStoredToken, postJson, setStoredToken } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  clientId: string | null;
};

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type MeResponse = {
  user: AuthUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setToken(null);
      setUser(null);
      setStatus("ready");
      return;
    }
    setToken(stored);
    void (async () => {
      try {
        const me = await getJson<MeResponse>("/v1/auth/me", stored);
        setUser(me.user);
      } catch {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setStatus("ready");
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await postJson<LoginResponse>("/v1/auth/login", { email, password });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      token,
      login,
      logout,
    }),
    [status, user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
