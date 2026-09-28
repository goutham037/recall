import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { AuthLayout } from "./Signin";

export default function Signup() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
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
      signIn(email, name);
      nav("/app/chat", { replace: true });
    }, 350);
  }

  return (
    <AuthLayout side="signup">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label">Name</label>
          <input
            className="input"
            placeholder="Priya Mehra"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="field-label">Work email</label>
          <input
            className="input"
            type="email"
            placeholder="you@northpulse.example"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="4+ chars, anything"
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
          {busy ? "Opening a dossier…" : "Create desk →"}
        </button>
        <div className="text-center text-[12.5px] text-muted pt-2">
          Already on file?{" "}
          <Link to="/signin" className="link-underline">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
