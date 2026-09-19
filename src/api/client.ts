import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

/**
 * Resolve API base URL for Expo Go on a physical phone.
 * Uses the same LAN host Expo Metro is serving from (QR / tunnel host),
 * so `localhost` is never used on device.
 */
function resolveApiUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  const configured = extra?.apiUrl?.trim();

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost ||
    (
      Constants as {
        manifest?: { debuggerHost?: string };
      }
    ).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8000/api/v1`;
    }
  }

  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured;
  }

  // Emulator / web fallback
  return configured || "http://localhost:8000/api/v1";
}

export const API_URL = resolveApiUrl();

const ACCESS_KEY = "lifeos_access";
const REFRESH_KEY = "lifeos_refresh";

export type TokenPair = { access_token: string; refresh_token: string };

export async function saveTokens(tokens: TokenPair): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, tokens.access_token);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh_token);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function refreshAccess(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    await clearTokens();
    return null;
  }
  const data = (await res.json()) as TokenPair;
  await saveTokens(data);
  return data.access_token;
}

function isFormDataBody(body: BodyInit | null | undefined): boolean {
  if (!body || typeof body === "string") return false;
  if (typeof FormData !== "undefined" && body instanceof FormData) return true;
  return typeof body === "object" && "append" in body;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!isFormDataBody(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    let token = await getAccessToken();
    if (!token) throw new ApiError(401, "Not authenticated");
    headers.set("Authorization", `Bearer ${token}`);

    let res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (res.status === 401) {
      token = await refreshAccess();
      if (!token) throw new ApiError(401, "Session expired");
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
    return parseResponse<T>(res);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return parseResponse<T>(res);
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new ApiError(res.status, formatDetail(data.detail) || res.statusText || "Request failed");
  }
  return data as T;
}

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const row = item as { loc?: unknown[]; msg?: string };
          const field = Array.isArray(row.loc)
            ? row.loc.filter((p) => p !== "body").join(".")
            : "";
          const msg = row.msg || "Invalid value";
          return field ? `${field}: ${msg}` : msg;
        }
        return String(item);
      })
      .filter(Boolean)
      .join(" · ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return "";
}


export type User = {
  id: string;
  email: string;
  display_name: string | null;
  onboarding_completed: boolean;
  ai_mode: "hosted" | "byok";
  credit_balance: number;
  has_byok_key: boolean;
  remind_before_minutes: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  google_calendar_connected?: boolean;
  profession?: string | null;
  professions?: string[] | null;
  age?: number | null;
  busy_level?: number | null;
  use_cases?: string[] | null;
  profile_completed?: boolean;
};

export type ProfileSurvey = {
  professions?: string[];
  age?: number;
  busy_level?: number;
  use_cases?: string[];
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_at: string | null;
  remind_at: string | null;
  status: "open" | "done";
  source: "chat" | "manual" | "google";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  notes: string | null;
  location: string | null;
  start_at: string;
  end_at: string | null;
  remind_at: string | null;
  source: "chat" | "manual" | "google";
  external_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actions?: Array<{
    type: string;
    summary: string;
    entity_id?: string;
    undone?: boolean;
  }> | null;
  linked_entity_ids?: string[] | null;
  created_at: string;
};

export const api = {
  register: (email: string, password: string, display_name?: string) =>
    apiFetch<TokenPair>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, display_name }) },
      false
    ),
  login: (email: string, password: string) =>
    apiFetch<TokenPair>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    ),
  loginWithGoogle: (access_token: string) =>
    apiFetch<TokenPair>(
      "/auth/google",
      { method: "POST", body: JSON.stringify({ access_token }) },
      false
    ),
  me: () => apiFetch<User>("/me"),
  updateMe: (body: Partial<User> & Record<string, unknown>) =>
    apiFetch<User>("/me", { method: "PATCH", body: JSON.stringify(body) }),
  saveProfile: (body: ProfileSurvey) =>
    apiFetch<User>("/me/profile", { method: "PUT", body: JSON.stringify(body) }),
  updateAi: (body: { ai_mode: "hosted" | "byok"; gemini_api_key?: string }) =>
    apiFetch<User>("/me/ai", { method: "PUT", body: JSON.stringify(body) }),
  today: () => apiFetch<{ tasks: Task[]; events: EventItem[] }>("/today"),
  tasks: (status?: string) =>
    apiFetch<Task[]>(status ? `/tasks?status=${status}` : "/tasks"),
  createTask: (body: { title: string; due_at?: string; notes?: string }) =>
    apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
  completeTask: (id: string) =>
    apiFetch<Task>(`/tasks/${id}/complete`, { method: "POST" }),
  deleteTask: (id: string) =>
    apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),
  events: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const qs = q.toString();
    return apiFetch<EventItem[]>(`/events${qs ? `?${qs}` : ""}`);
  },
  createEvent: (body: {
    title: string;
    start_at: string;
    end_at?: string;
    location?: string;
  }) => apiFetch<EventItem>("/events", { method: "POST", body: JSON.stringify(body) }),
  deleteEvent: (id: string) =>
    apiFetch<void>(`/events/${id}`, { method: "DELETE" }),
  chatHistory: () => apiFetch<ChatMessage[]>("/chat/messages"),
  chatSend: (message: string) =>
    apiFetch<ChatMessage>("/chat/send", {
      method: "POST",
      body: JSON.stringify({
        message,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    }),
  chatTranscribe: (uri: string, name = "voice.m4a", type = "audio/mp4") => {
    const form = new FormData();
    form.append("file", { uri, name, type } as unknown as Blob);
    return apiFetch<{ text: string }>("/chat/transcribe", { method: "POST", body: form });
  },
  chatUndo: (message_id: string, action_index = 0) =>
    apiFetch<{ ok: boolean }>("/chat/undo", {
      method: "POST",
      body: JSON.stringify({ message_id, action_index }),
    }),
  checkout: () =>
    apiFetch<{ checkout_url: string }>("/billing/checkout", { method: "POST" }),
  googleCalendarStatus: () =>
    apiFetch<{ connected: boolean }>("/calendar/google/status"),
  googleCalendarConnect: () =>
    apiFetch<{ url: string }>("/calendar/google/connect"),
  googleCalendarSync: () =>
    apiFetch<{ synced: number; removed: number }>("/calendar/google/sync", {
      method: "POST",
    }),
  googleCalendarDisconnect: () =>
    apiFetch<{ connected: boolean }>("/calendar/google", { method: "DELETE" }),
};
