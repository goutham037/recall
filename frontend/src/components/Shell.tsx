import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CommandPalette } from "./CommandPalette";

function BrandMark() {
  return (
    <NavLink to="/app/chat" className="flex items-center group mr-2" title="Recall — An AI agent that remembers">
      <img
        src="/Recall_Logo.png"
        alt="RECALL Logo"
        className="h-12 md:h-[50px] w-auto object-contain transition-transform group-hover:scale-[1.02]"
      />
    </NavLink>
  );
}

function StatusRow() {
  const [s, setS] = useState<any | null>(null);
  useEffect(() => {
    let alive = true;
    const pull = () =>
      api.status().then((x) => alive && setS(x)).catch(() => { });
    pull();
    const t = setInterval(pull, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const hindsightReachable = s?.hindsight?.reachable;
  const groqReachable = s?.groq?.reachable;

  return (
    <div className="hidden lg:flex items-center gap-2">
      <span className="pill text-[11px] py-1 px-2.5 flex items-center gap-1.5" title="Vectorize Hindsight memory layer">
        <span className={`w-1.5 h-1.5 rounded-full ${hindsightReachable ? "bg-brand" : "bg-stone-400"}`} />
        <span className="text-ink font-medium">Memory connected</span>
      </span>
      <span className="pill text-[11px] py-1 px-2.5 flex items-center gap-1.5" title="Groq reasoning engine">
        <span className={`w-1.5 h-1.5 rounded-full ${groqReachable ? "bg-brand" : "bg-stone-400"}`} />
        <span className="text-ink font-medium">Reasoning ready</span>
      </span>
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
        className="avatar hover:brightness-110 transition"
        title={session.email}
      >
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 card z-50 p-4 shadow-pop">
            <div className="text-[11px] uppercase tracking-widest text-muted font-semibold">
              Signed in as
            </div>
            <div className="serif text-[20px] leading-snug mt-1 tracking-tighter2">
              {session.name}
            </div>
            <div className="text-[12px] mono text-muted truncate">
              {session.email}
            </div>
            <div className="hr-soft my-3" />
            <button
              className="btn btn-sm w-full"
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


function Nav() {
  const link = (to: string, label: string, end?: boolean) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "px-3 py-1.5 text-[13px] font-medium transition-colors relative " +
        (isActive
          ? "text-ink font-semibold after:absolute after:bottom-[-13px] after:left-3 after:right-3 after:h-[2px] after:bg-brand"
          : "text-muted hover:text-ink")
      }
    >
      {label}
    </NavLink>
  );
  return (
    <nav className="flex items-center gap-0.5">
      {link("/app/chat", "Ask")}
      {link("/app/studio", "Create")}
      {link("/app/calendar", "Plan")}
      {link("/app/competitors", "Watch")}
      {link("/app/memory", "Memory")}
      {link("/app/ship", "Ship")}
      {link("/app/setup", "Dossier")}
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [brandName, setBrandName] = useState<string>("");
  useEffect(() => {
    api.brand.get().then((r) => {
      if (r?.brand?.name) setBrandName(r.brand.name);
    }).catch(() => { });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="appbar">
        <div className="appbar-inner">
          <BrandMark />
          {brandName && (
            <span className="pill text-[11px] mono border-brand/40 bg-brand-fill/60 text-brand-deep font-medium hidden lg:inline-flex">
              {brandName}
            </span>
          )}
          <div className="mx-4 h-6 w-px bg-line hidden md:block" />
          <Nav />
          <div className="ml-auto flex items-center gap-3">
            <StatusRow />
            <UserMenu />
          </div>
        </div>
      </div>
      <main className="page-wrap">{children}</main>
      <CommandPalette />
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full px-8 py-8">
      <div className="hr-soft mb-6" />
      <div className="flex items-center justify-between text-[12px] text-muted flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="brand-mark" style={{ width: 22, height: 22, fontSize: 13 }}>R</span>
          <span className="font-semibold text-ink">Recall</span>
          <span>· a memory-first CMO</span>
        </div>
        <div className="mono">
          Hindsight × Groq × Meta Graph · MemHack '26
        </div>
      </div>
    </footer>
  );
}

export function PageHeader({
  eyebrow,
  title,
  kicker,
  right,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  kicker?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow reveal"><span className="dot-lead" />{eyebrow}</div>}
        <h1 className={"mt-3 reveal-1"}>{title}</h1>
        {kicker && <div className="kicker mt-3 reveal-2">{kicker}</div>}
      </div>
      {right && <div className="reveal-2">{right}</div>}
    </div>
  );
}

/* Sparkline helper — SVG polyline over a set of values */
export function Sparkline({
  values,
  width = 120,
  height = 32,
  filled = true,
}: {
  values: number[];
  width?: number;
  height?: number;
  filled?: boolean;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, values.length - 1);
  const y = (v: number) => height - 2 - ((v - min) / range) * (height - 4);
  const points = values.map((v, i) => `${i * step},${y(v)}`).join(" ");
  const areaD = `M0,${height} L${points.split(" ").join(" L")} L${width},${height} Z`;
  const lineD = "M" + points.split(" ").join(" L");
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {filled && <path className="area" d={areaD} />}
      <path d={lineD} />
    </svg>
  );
}

/* Progress ring */
export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
