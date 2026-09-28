import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

function todayLine() {
  const d = new Date();
  const dow = d.toLocaleDateString(undefined, { weekday: "long" });
  const dm = d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const y = d.getFullYear();
  return `${dow}, ${dm} ${y}`;
}

function StatusRow() {
  const [s, setS] = useState<any | null>(null);
  useEffect(() => {
    let alive = true;
    const pull = () =>
      api.status().then((x) => alive && setS(x)).catch(() => {});
    pull();
    const t = setInterval(pull, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  const dot = (label: string, key: string) => {
    const info = s?.[key];
    const state = !info?.configured
      ? "dot-gray"
      : info?.reachable
        ? "dot-green"
        : "dot-amber";
    return (
      <span
        key={key}
        className="pill"
        title={JSON.stringify(info || {}, null, 2)}
      >
        <span className={"dot " + state} />
        <span className="font-medium text-ink">{label}</span>
      </span>
    );
  };
  return (
    <div className="flex items-center gap-1.5">
      {dot("Hindsight", "hindsight")}
      {dot("Groq", "groq")}
      {dot("Meta", "meta")}
    </div>
  );
}

function UserMenu() {
  const { session, signOut } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  if (!session) return null;
  const initial = (session.name || session.email)[0]?.toUpperCase() || "?";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full bg-ink text-canvas font-display font-semibold text-[15px] flex items-center justify-center hover:bg-[#2A2A22] transition-colors"
        title={session.email}
      >
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 card z-50 p-4">
            <div className="dateline">Signed in as</div>
            <div className="serif text-[20px] leading-snug tracking-editorial mt-1">
              {session.name}
            </div>
            <div className="text-[12px] muted mono truncate">
              {session.email}
            </div>
            <div className="hr-soft my-3" />
            <button
              className="btn btn-sm w-full justify-center"
              onClick={() => {
                setOpen(false);
                signOut();
                nav("/", { replace: true });
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Masthead() {
  const [issue, setIssue] = useState<number>(1);
  useEffect(() => {
    api.memory
      .stats()
      .then((s: any) => {
        const n = s?.total_nodes || 0;
        setIssue(Math.max(1, Math.ceil((n + 1) / 25)));
      })
      .catch(() => {});
  }, []);
  const dateline = useMemo(todayLine, []);
  return (
    <div className="masthead">
      <div className="masthead-inner">
        <div className="masthead-side">
          <div className="dateline">
            Vol. 01 &nbsp;·&nbsp; Issue {String(issue).padStart(2, "0")}
            <br />
            {dateline}
          </div>
        </div>
        <NavLink to="/app/chat" className="text-center block">
          <div className="masthead-title">Recall</div>
          <div className="masthead-tag">The Marketing Desk</div>
        </NavLink>
        <div className="masthead-side justify-end gap-3">
          <StatusRow />
          <UserMenu />
        </div>
      </div>
      <Nav />
    </div>
  );
}

function Nav() {
  const link = (to: string, label: string, end?: boolean) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "nav-link" + (isActive ? " nav-link-active" : "")
      }
    >
      {label}
    </NavLink>
  );
  return (
    <nav className="nav">
      {link("/app/chat", "Chat")}
      {link("/app/studio", "Studio")}
      {link("/app/calendar", "Calendar")}
      {link("/app/competitors", "Competitors")}
      {link("/app/memory", "Memory")}
      {link("/app/setup", "Setup")}
      <span className="ml-auto dateline hidden md:inline">
        A memory-first CMO for the modern brand.
      </span>
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grain-mask">
      <Masthead />
      <main className="max-w-[1360px] mx-auto px-8 py-10">{children}</main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="max-w-[1360px] mx-auto px-8 pb-10">
      <div className="hr-ink my-6" />
      <div className="flex items-baseline justify-between gap-6 flex-wrap">
        <div className="serif text-2xl">Recall</div>
        <div className="dateline">
          Set in Instrument Serif &amp; Instrument Sans · Data in JetBrains Mono
        </div>
        <div className="dateline">
          Hindsight × Groq × Meta Graph API · MemHack '26
        </div>
      </div>
    </footer>
  );
}

export function PageHead({
  eyebrow,
  title,
  kicker,
  right,
}: {
  eyebrow: string;
  title: React.ReactNode;
  kicker?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="pb-6 mb-8 border-b border-ink">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="max-w-3xl">
          <div className="eyebrow reveal">{eyebrow}</div>
          <div className="h1 mt-4 reveal-1">{title}</div>
          {kicker && (
            <div className="mt-4 text-[15px] leading-relaxed text-pen max-w-2xl reveal-2">
              {kicker}
            </div>
          )}
        </div>
        {right && <div className="shrink-0 reveal-2">{right}</div>}
      </div>
    </header>
  );
}
