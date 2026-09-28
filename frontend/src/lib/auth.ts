import { useEffect, useState } from "react";

export type Session = { email: string; name: string; joinedAt: string };

const KEY = "recall.session";

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(readSession);

  useEffect(() => {
    const onChange = (e: StorageEvent) => {
      if (e.key === KEY) setSession(readSession());
    };
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  const signIn = (email: string, name?: string) => {
    const s: Session = {
      email: email.trim().toLowerCase(),
      name: (name || email.split("@")[0] || "guest").trim(),
      joinedAt: new Date().toISOString(),
    };
    writeSession(s);
    setSession(s);
  };
  const signOut = () => {
    writeSession(null);
    setSession(null);
  };
  return { session, signIn, signOut };
}
