import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getImpersonationBackupToken,
  getJson,
  getStoredToken,
  mailingApiV1Path,
  postJson,
  setImpersonationBackupToken,
  setStoredToken,
} from "@/lib/api";
import { impersonatePlatformAdminUser } from "@/lib/platformAdminUsers";

export type ImpersonationActor = {
  id: string;
  email: string;
};

export type AuthUser = {
  id: string;
  email: string;
  clientId: string | null;
  sendingDomains: string[];
  defaultFrom: string | null;
  impersonation: ImpersonationActor | null;
};

type RawAuthUser = Omit<AuthUser, "sendingDomains" | "defaultFrom" | "impersonation"> & {
  sendingDomains?: string[];
  defaultFrom?: string | null;
  impersonation?: ImpersonationActor | null;
};

function normalizeAuthUser(raw: RawAuthUser): AuthUser {
  const actor = raw.impersonation;
  const impersonation =
    actor && typeof actor.id === "string" && typeof actor.email === "string"
      ? { id: actor.id, email: actor.email }
      : null;
  return {
    id: raw.id,
    email: raw.email,
    clientId: raw.clientId,
    sendingDomains: Array.isArray(raw.sendingDomains) ? raw.sendingDomains : [],
    defaultFrom: raw.defaultFrom ?? null,
    impersonation,
  };
}

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isImpersonating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  startImpersonation: (targetUserId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type LoginResponse = {
  token: string;
  user: RawAuthUser;
};

type MeResponse = {
  user: RawAuthUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const applySession = useCallback((nextToken: string, nextUser: AuthUser) => {
    setStoredToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

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
        const me = await getJson<MeResponse>(`${mailingApiV1Path}/auth/me`, stored);
        setUser(normalizeAuthUser(me.user));
      } catch {
        setStoredToken(null);
        setImpersonationBackupToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setStatus("ready");
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await postJson<LoginResponse>(`${mailingApiV1Path}/auth/login`, {
      email,
      password,
    });
    setImpersonationBackupToken(null);
    applySession(res.token, normalizeAuthUser(res.user));
  }, [applySession]);

  const logout = useCallback(() => {
    setStoredToken(null);
    setImpersonationBackupToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const startImpersonation = useCallback(
    async (targetUserId: string) => {
      const adminToken = getStoredToken();
      if (!adminToken) {
        throw new Error("NO_SESSION");
      }
      if (getImpersonationBackupToken()) {
        throw new Error("ALREADY_IMPERSONATING");
      }
      const res = await impersonatePlatformAdminUser(adminToken, targetUserId);
      setImpersonationBackupToken(adminToken);
      applySession(res.token, normalizeAuthUser(res.user));
    },
    [applySession],
  );

  const stopImpersonation = useCallback(async () => {
    const backup = getImpersonationBackupToken();
    if (!backup) {
      throw new Error("NOT_IMPERSONATING");
    }
    setImpersonationBackupToken(null);
    setStoredToken(backup);
    setToken(backup);
    const me = await getJson<MeResponse>(`${mailingApiV1Path}/auth/me`, backup);
    setUser(normalizeAuthUser(me.user));
  }, []);

  const isImpersonating = user?.impersonation != null;

  const value = useMemo(
    () => ({
      status,
      user,
      token,
      isImpersonating,
      login,
      logout,
      startImpersonation,
      stopImpersonation,
    }),
    [
      status,
      user,
      token,
      isImpersonating,
      login,
      logout,
      startImpersonation,
      stopImpersonation,
    ],
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
