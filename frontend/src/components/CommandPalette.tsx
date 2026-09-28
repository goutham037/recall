import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Action = {
  id: string;
  title: string;
  hint?: string;
  keywords?: string;
  perform: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actions: Action[] = useMemo(
    () => [
      { id: "chat", title: "Go to Chat", hint: "the correspondence", keywords: "chat talk agent conversation", perform: () => nav("/app/chat") },
      { id: "studio", title: "Open Studio", hint: "generate, analyze, recommend", keywords: "studio generator generate analytics trending recommendations", perform: () => nav("/app/studio") },
      { id: "calendar", title: "Open Calendar", hint: "weekly grid + drafts", keywords: "calendar week plan schedule", perform: () => nav("/app/calendar") },
      { id: "competitors", title: "Open Competitors", hint: "watch list", keywords: "competitors rivals track watch", perform: () => nav("/app/competitors") },
      { id: "memory", title: "Open Memory", hint: "recall, reflect, retain", keywords: "memory hindsight recall reflect archive brain", perform: () => nav("/app/memory") },
      { id: "setup", title: "Setup & integrations", hint: "keys + brand seed", keywords: "setup config env keys seed brand integrations", perform: () => nav("/app/setup") },
      { id: "landing", title: "View the landing page", hint: "public marketing", keywords: "landing home marketing public", perform: () => nav("/") },
      { id: "signout", title: "Sign out", hint: "end session", keywords: "signout logout leave", perform: () => {
        localStorage.removeItem("recall.session");
        window.dispatchEvent(new StorageEvent("storage", { key: "recall.session" }));
        nav("/");
      } },
    ],
    [nav]
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return actions;
    const s = q.toLowerCase();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(s) ||
        (a.hint || "").toLowerCase().includes(s) ||
        (a.keywords || "").toLowerCase().includes(s)
    );
  }, [q, actions]);

  useEffect(() => setIdx(0), [q, open]);

  if (!open) return null;
  return (
    <div className="kbar-scrim" onClick={() => setOpen(false)}>
      <div className="kbar" onClick={(e) => e.stopPropagation()}>
        <input
          className="kbar-input"
          placeholder="Jump to…  (⌘K to close)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
            if (e.key === "Enter") {
              e.preventDefault();
              filtered[idx]?.perform();
              setOpen(false);
            }
          }}
          autoFocus
        />
        <div className="kbar-list">
          {filtered.map((a, i) => (
            <div
              key={a.id}
              className={"kbar-item " + (i === idx ? "active" : "")}
              onMouseEnter={() => setIdx(i)}
              onClick={() => {
                a.perform();
                setOpen(false);
              }}
            >
              <div>
                <div className="kbar-title">{a.title}</div>
                {a.hint && <div className="kbar-hint">{a.hint}</div>}
              </div>
              <span className="kbd">↵</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-muted">No matches.</div>
          )}
        </div>
      </div>
    </div>
  );
}
