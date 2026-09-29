// The vite dev server proxies /api/* -> http://localhost:8000/*
const BASE = "/api";

async function req<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`${r.status} ${path}: ${txt.slice(0, 240)}`);
  }
  if (r.status === 204) return {} as T;
  return (await r.json()) as T;
}

export const api = {
  status: () => req("/status"),
  health: () => req("/health"),

  brand: {
    get: () => req("/brand"),
    put: (body: any) => req("/brand", { method: "PUT", body: JSON.stringify(body) }),
    seed: () => req("/brand/seed", { method: "POST" }),
  },

  agent: {
    chat: (message: string) =>
      req("/agent/chat", { method: "POST", body: JSON.stringify({ message }) }),
    history: () => req("/agent/history"),
    wipe: () => req("/agent/history", { method: "DELETE" }),
  },

  content: {
    plan: (body: {
      days: number;
      channels: string[];
      focus?: string;
      cta_link?: string;
      start_date?: string;
    }) => req("/content/plan", { method: "POST", body: JSON.stringify(body) }),
    calendar: (status?: string) =>
      req(`/content/calendar${status ? `?status=${status}` : ""}`),
    clearCalendar: (status?: string) =>
      req(`/content/calendar${status ? `?status=${status}` : ""}`, { method: "DELETE" }),
    createItem: (body: any) =>
      req("/content/calendar", { method: "POST", body: JSON.stringify(body) }),
    updateItem: (id: number, patch: any) =>
      req(`/content/calendar/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    deleteItem: (id: number) =>
      req(`/content/calendar/${id}`, { method: "DELETE" }),
    publish: (id: number) =>
      req(`/content/calendar/${id}/publish`, { method: "POST" }),
    posts: (limit = 20) => req(`/content/posts?limit=${limit}`),
    clearPosts: () => req("/content/posts", { method: "DELETE" }),
    deletePost: (id: number) => req(`/content/posts/${id}`, { method: "DELETE" }),
    refreshPerf: () =>
      req(`/content/posts/refresh-performance`, { method: "POST" }),
  },

  competitors: {
    list: () => req("/competitors"),
    track: (handle: string, channel: "instagram" | "facebook") =>
      req("/competitors/track", {
        method: "POST",
        body: JSON.stringify({ handle, channel }),
      }),
    posts: (handle: string, limit = 20) =>
      req(`/competitors/${encodeURIComponent(handle)}/posts?limit=${limit}`),
    untrack: (handle: string) =>
      req(`/competitors/${encodeURIComponent(handle)}`, { method: "DELETE" }),
  },

  studio: {
    generate: (body: {
      topic: string;
      channels?: string[];
      tone?: string;
      cta_link?: string;
      save_as_draft?: boolean;
      save_as_drafts?: boolean;
    }) =>
      req("/studio/generate", { method: "POST", body: JSON.stringify(body) }),
    analytics: () => req("/studio/analytics"),
    recommendations: () => req("/studio/recommendations"),
    trending: () => req("/studio/trending"),
  },

  memory: {
    stats: () => req("/memory/stats"),
    list: (limit = 50, offset = 0) =>
      req(`/memory/list?limit=${limit}&offset=${offset}`),
    recall: (query: string, tags?: string[]) =>
      req(`/memory/recall`, {
        method: "POST",
        body: JSON.stringify({ query, tags }),
      }),
    reflect: (question: string) =>
      req(`/memory/reflect`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }),
    retain: (content: string, tags?: string[]) =>
      req("/memory/retain", {
        method: "POST",
        body: JSON.stringify({ content, tags, context: "manual" }),
      }),
    graph: () => req("/memory/graph"),
  },
};

export type ChatReply = {
  ok: boolean;
  reply: string;
  trace: Array<{ hop: number; content_preview: string; tool_calls: string[] }>;
};
