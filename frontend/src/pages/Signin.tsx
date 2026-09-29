import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Signin() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.includes("@") || pw.length < 4) {
      setErr("Enter any email and a 4+ char password. It's a demo.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      signIn(email);
      nav("/app/chat", { replace: true });
    }, 350);
  }

  return (
    <AuthLayout side="signin">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label">Work email</label>
          <input
            className="input"
            type="email"
            placeholder="you@northpulse.example"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="anything, 4+ chars"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </div>
        {err && (
          <div className="text-danger text-[13px] border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        <button className="btn btn-primary btn-lg w-full" disabled={busy}>
          {busy ? "Opening the desk…" : "Sign in →"}
        </button>
        <div className="text-center text-[12.5px] text-muted pt-2">
          Not on file yet?{" "}
          <Link to="/signup" className="link-underline">Sign up</Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "signin" | "signup";
}) {
  return (
    <div className="min-h-screen bg-canvas grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Left panel */}
      <aside className="hidden lg:flex flex-col justify-between border-r border-line px-14 py-10 bg-quiet/40 relative">
        <div className="absolute inset-0 dotgrid-soft pointer-events-none" />
        <Link to="/" className="relative text-[12.5px] text-muted hover:text-ink transition-colors">
          ← Back to landing
        </Link>
        <div className="relative">
          <div className="flex items-center">
            <Link to="/" className="group inline-block" title="RECALL">
              <img
                src="/Recall_Logo.png"
                alt="RECALL Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>
          <h1 className="h1 mt-10 leading-[0.95]" style={{ fontSize: "clamp(48px, 5vw, 72px)" }}>
            {side === "signin" ? (
              <>Welcome<br />back.</>
            ) : (
              <>A new<br /><span className="serif-italic text-brand-deep">dossier.</span></>
            )}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-pen max-w-md">
            {side === "signin"
              ? "The archive kept your seat warm. Everything you've filed stays retrievable."
              : "Start with the demo brand and six past-post learnings. It gets smarter every turn."}
          </p>
          <div className="mt-10 flex flex-col gap-2 text-[12.5px] text-muted">
            <span>· Persistent brand memory in Hindsight</span>
            <span>· Groq-driven agent with function calling</span>
            <span>· Real Meta Graph publishing</span>
          </div>
        </div>
        <div className="relative mono text-[11px] text-muted tracking-widest">
          MEMHACK '26 · HINDSIGHT × GROQ × META
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center">
            <Link to="/" className="group inline-block" title="RECALL">
              <img
                src="/Recall_Logo.png"
                alt="RECALL Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>
          <div className="eyebrow">
            <span className="dot-lead" /> {side === "signin" ? "Sign in" : "Sign up"}
          </div>
          <h2 className="h1 mt-3 mb-2" style={{ fontSize: "clamp(30px, 3.5vw, 40px)", lineHeight: 1.05 }}>
            {side === "signin" ? (
              <>Sign in to your <span className="serif-italic text-brand-deep">desk</span>.</>
            ) : (
              <>Start your <span className="serif-italic text-brand-deep">dossier</span>.</>
            )}
          </h2>
          <p className="text-[13.5px] text-muted mb-6">
            Demo mode — any credentials work. Nothing is sent anywhere.
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
