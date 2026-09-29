import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { AuthLayout } from "./Signin";

export default function Signup() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  // Brand onboarding details
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [tagline, setTagline] = useState("");
  const [voice, setVoice] = useState("");
  const [audience, setAudience] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function fillDemo() {
    setName("Prabhu");
    setEmail("prabhu@example.com");
    setPw("password123");
    setBrandName("Sunshainy Mart");
    setWebsite("https://sunshainy-mart.vercel.app/");
    setTagline("Groceries at your doorstep in 15 minutes");
    setVoice("Direct, warm, surprising — people talking in group chat");
    setAudience("All the urban people and apartments people");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.includes("@") || pw.length < 4) {
      setErr("Enter any valid email and a 4+ character password.");
      return;
    }
    setBusy(true);
    try {
      // If brand details provided, update the active brand
      if (brandName.trim()) {
        await api.brand.put({
          name: brandName.trim(),
          website: website.trim() || undefined,
          tagline: tagline.trim() || undefined,
          voice: voice.trim() || undefined,
          audience: audience.trim() || undefined,
          pillars_json: [
            { name: "Product in use", detail: "Gear in action, real-world utility" },
            { name: "Customer stories", detail: "Real experiences and community highlights" },
            { name: "Drop hype", detail: "Teasers and launch announcements" },
            { name: "Behind the scenes", detail: "Design process, quality and materials" },
          ],
        });
      }
      signIn(email, name || brandName);
      nav("/app/chat", { replace: true });
    } catch (ex: any) {
      setErr(ex.message || "Failed to set up brand dossier.");
      setBusy(false);
    }
  }

  return (
    <AuthLayout side="signup">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-muted">Account & Brand Setup</span>
          <button
            type="button"
            className="btn btn-sm text-[11px] py-1 px-2.5 bg-brand-fill text-brand-deep border-brand"
            onClick={fillDemo}
          >
            Quick Fill Demo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="field-label">Your Name</label>
            <input
              className="input"
              placeholder="e.g. Prabhu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="field-label">Work Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@yourbrand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="4+ characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
        </div>

        <div className="hr-soft my-2" />

        <div>
          <label className="field-label font-semibold text-ink">Brand Name</label>
          <input
            className="input"
            placeholder="e.g. Sunshainy Mart, Prabhu's Art Gallery"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="field-label">Store / Website URL</label>
            <input
              className="input mono text-[12px]"
              placeholder="https://sunshainy-mart.vercel.app/"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Tagline / Mission</label>
            <input
              className="input"
              placeholder="e.g. Water-repellent performance gear"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Brand Voice & Tone</label>
          <input
            className="input"
            placeholder="e.g. Warm, direct, active, conversational"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Target Audience</label>
          <input
            className="input"
            placeholder="e.g. Urban runners, fitness enthusiasts, 20-35"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>

        {err && (
          <div className="text-danger text-[13px] border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        <button className="btn btn-primary btn-lg w-full mt-2" disabled={busy}>
          {busy ? "Opening brand dossier…" : "Create desk & launch →"}
        </button>

        <div className="text-center text-[12.5px] text-muted pt-2">
          Already on file?{" "}
          <Link to="/signin" className="link-underline">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
