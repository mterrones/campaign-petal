const TOKEN_STORAGE_KEY = "enviamas_platform_token";

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw !== undefined && String(raw).trim() !== "") {
    return String(raw).replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function authHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(typeof body === "object" && body !== null && "error" in body ? String((body as { error: unknown }).error) : `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function postJson<TResponse>(
  path: string,
  body: unknown,
  init?: { token?: string | null },
): Promise<TResponse> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(init?.token ?? null),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as TResponse;
}

export async function patchJson<TResponse>(
  path: string,
  body: unknown,
  init?: { token?: string | null },
): Promise<TResponse> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(init?.token ?? null),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as TResponse;
}

export async function getJson<TResponse>(
  path: string,
  token: string,
): Promise<TResponse> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      ...authHeaders(token),
    },
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as TResponse;
}
