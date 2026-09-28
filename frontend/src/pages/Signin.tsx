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

  return <AuthLayout side="signin"><form onSubmit={submit} className="space-y-4">
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
      <div className="text-danger text-[13px] border border-danger/30 bg-dangerSoft rounded px-3 py-2">
        {err}
      </div>
    )}
    <button className="btn btn-primary w-full" disabled={busy}>
      {busy ? "Opening the desk…" : "Sign in →"}
    </button>
    <div className="text-center dateline pt-2">
      Not on file yet?{" "}
      <Link to="/signup" className="link-underline">
        Sign up
      </Link>
    </div>
  </form></AuthLayout>;
}

export function AuthLayout({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "signin" | "signup";
}) {
  return (
    <div className="min-h-screen grain-mask grid grid-cols-1 lg:grid-cols-2">
      {/* Editorial left */}
      <aside className="hidden lg:flex flex-col justify-between border-r border-ink px-14 py-12">
        <Link to="/" className="dateline">
          ← Back to cover
        </Link>
        <div>
          <div className="eyebrow eyebrow-brand">The Marketing Desk</div>
          <h1 className="h1 !text-[76px] mt-6 leading-[0.9]">
            Recall
          </h1>
          <p className="mt-6 serif text-[24px] leading-[1.25] tracking-editorial max-w-md">
            {side === "signin" ? (
              <>
                Welcome back.{" "}
                <span className="serif-italic text-brand-deep">
                  The archive kept your seat warm.
                </span>
              </>
            ) : (
              <>
                A new dossier{" "}
                <span className="serif-italic text-brand-deep">
                  begins here.
                </span>
              </>
            )}
          </p>
          <div className="mt-8 flex flex-col gap-2 dateline">
            <span>· Persistent brand memory in Hindsight</span>
            <span>· Groq-driven agent with function calling</span>
            <span>· Real Meta Graph publishing</span>
          </div>
        </div>
        <div className="dateline">
          MemHack '26 · Hindsight × Groq × Meta Graph
        </div>
      </aside>

      {/* Form right */}
      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <div className="masthead-title !text-[56px]">Recall</div>
            <div className="mono uppercase tracking-[0.28em] text-[10px] muted mt-2">
              The Marketing Desk
            </div>
          </div>
          <div className="eyebrow no-rules mb-3">
            {side === "signin" ? "Sign in" : "Sign up"}
          </div>
          <h2 className="h1 !text-[38px] leading-tight mb-2">
            {side === "signin" ? (
              <>
                Sign in to your{" "}
                <span className="serif-italic text-brand-deep">desk.</span>
              </>
            ) : (
              <>
                Start your{" "}
                <span className="serif-italic text-brand-deep">dossier.</span>
              </>
            )}
          </h2>
          <p className="text-[13.5px] muted mb-6">
            Demo mode — any credentials work. Nothing is sent anywhere.
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
