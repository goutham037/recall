import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Landing() {
  const { session } = useAuth();
  const primary = session ? "/app/chat" : "/signup";
  return (
    <div className="min-h-screen bg-canvas">
      {/* Top bar */}
      <header className="border-b border-line bg-canvas/85 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="brand-mark">R</Link>
          <span className="text-[13px] font-semibold text-ink tracking-tighter2">
            Recall
          </span>
          <span className="pill">
            <span className="dot dot-green" /> MemHack '26
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/signin" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to={primary} className="btn btn-primary btn-sm">
              {session ? "Open desk →" : "Start free"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 dotgrid-soft pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-14 items-start">
          <div>
            <div className="eyebrow reveal">
              <span className="dot-lead" /> A memory-first CMO
            </div>
            <h1 className="h1 mt-6 reveal-1" style={{ fontSize: "clamp(48px, 6vw, 84px)" }}>
              Marketing that{" "}
              <span className="serif-italic text-brand-deep">remembers</span>{" "}
              itself.
            </h1>
            <p className="mt-6 text-[17px] leading-[1.65] text-pen max-w-xl reveal-2">
              Every conversation, every published post, every performance metric,
              every rival move — retained. Recall recalls. Ask <span className="serif-italic">why</span>,
              and the desk reads from its own file.
            </p>
            <div className="mt-8 flex items-center gap-3 reveal-3">
              <Link to={primary} className="btn btn-primary btn-lg">
                {session ? "Enter the desk →" : "Start the demo →"}
              </Link>
              <Link to="/signin" className="btn btn-lg">
                Sign in
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[12px] text-muted reveal-4">
              <span className="mono">Free during MemHack</span>
              <span className="w-1 h-1 rounded-full bg-lineStrong" />
              <span className="mono">60-second setup</span>
              <span className="w-1 h-1 rounded-full bg-lineStrong" />
              <span className="mono">Real Meta publishing</span>
            </div>
          </div>

          {/* Live agent card */}
          <div className="reveal-4">
            <div className="card p-5 shadow-cardHover">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">
                <span className="dot dot-green" /> Live
                <span className="mono ml-auto text-soft">turn 04</span>
              </div>
              <div className="bubble-user max-w-[80%] ml-auto mb-2">
                What kind of post gets the most saves?
              </div>
              <div className="bubble-agent max-w-[92%]">
                Your <span className="font-semibold">Second-mile Stories</span> pillar drives ~2× the save-rate of anything else. The <span className="serif-italic">"kilometre 8 hurts"</span> reel is your outlier — <span className="mono text-brand-deep">340 saves at 21K reach</span>.
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="tag tag-brand">used · recall_memory</span>
                <span className="tag tag-brand">used · reflect_on_memory</span>
              </div>
              <div className="mt-4 pt-4 border-t border-line">
                <div className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-2">
                  Grounded on
                </div>
                <div className="text-[12.5px] text-pen leading-relaxed border-l-2 border-brand pl-3">
                  Reel 'kilometre 8 hurts, we made this for what comes after' scored 21K reach, 340 saves, 6.1% engagement. Aug 12.
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 justify-end text-[11px] text-muted">
              <span className="mono">saving to Hindsight</span>
              <span className="dot dot-green" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-line bg-quiet/40">
        <div className="max-w-[1200px] mx-auto px-6 py-14 grid md:grid-cols-3 gap-8">
          <Pillar n="01" name="Memory" body="Every fact filed into Hindsight, retrieved on demand. Every recommendation cites it." />
          <Pillar n="02" name="Publishing" body="One-click posts to Facebook Page + Instagram Business through Meta Graph. Insights come home as new memories." />
          <Pillar n="03" name="Insight" body="Metrics with an editorial. Ask why and get a synthesized answer, with sources." />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 grid md:grid-cols-[1fr_1.3fr] gap-14">
        <div>
          <div className="eyebrow"><span className="dot-lead" /> How it works</div>
          <h2 className="h1 mt-4" style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
            Five acts.{" "}
            <span className="serif-italic text-brand-deep">Then it's yours.</span>
          </h2>
          <p className="mt-4 text-[15px] muted leading-relaxed max-w-md">
            A memory-first workflow that gets sharper each cycle.
          </p>
        </div>
        <ol className="editorial-list">
          <li><b className="text-ink">Onboard the brand.</b> Voice, audience, pillars — filed as durable memories.</li>
          <li><b className="text-ink">Ask for a plan.</b> Every draft carries a <span className="serif-italic">Why now</span> citing the memory it leaned on.</li>
          <li><b className="text-ink">Publish.</b> One click ships to FB + IG. The post itself becomes a memory.</li>
          <li><b className="text-ink">Fetch performance.</b> Insights come back as retained learnings.</li>
          <li><b className="text-ink">Ask again.</b> The next answer is grounded in the last cycle's results. Smarter every turn.</li>
        </ol>
      </section>

      {/* Features grid */}
      <section className="border-t border-line">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="section-divider">Eleven capabilities</div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} n={i + 1} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Big quote */}
      <section className="bg-ink text-canvas">
        <div className="max-w-[900px] mx-auto px-6 py-24 text-center">
          <div className="eyebrow justify-center text-canvas/60">
            <span className="dot-lead" /> The new craft
          </div>
          <blockquote className="mt-6 serif" style={{ fontSize: "clamp(28px, 3.5vw, 46px)", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Marketing was <span className="serif-italic text-brand">institutional memory</span> before it was software. Recall is the software of the memory.
          </blockquote>
          <div className="mt-8 mono text-canvas/50 text-[12px] tracking-widest">
            THE MARKETING DESK · VOL. 01
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="max-w-[1200px] mx-auto px-6 py-20 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="eyebrow"><span className="dot-lead" /> Get access</div>
            <h2 className="h1 mt-4" style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
              Open the desk in{" "}
              <span className="serif-italic text-brand-deep">60 seconds.</span>
            </h2>
            <p className="mt-4 text-[15px] muted leading-relaxed max-w-lg">
              Sign up with any email. This is a hackathon demo — no
              verification, no card, no waiting list.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted">Free during MemHack</div>
            <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed">
              <li className="flex gap-2"><span className="text-brand">·</span> Persistent brand memory in Hindsight</li>
              <li className="flex gap-2"><span className="text-brand">·</span> Groq-driven agent with function calling</li>
              <li className="flex gap-2"><span className="text-brand">·</span> Real Meta Graph publishing</li>
              <li className="flex gap-2"><span className="text-brand">·</span> Post generator + weekly calendar</li>
              <li className="flex gap-2"><span className="text-brand">·</span> Analytics, trending, recommendations</li>
            </ul>
            <div className="mt-5">
              <Link to={primary} className="btn btn-primary w-full">
                {session ? "Open the desk" : "Sign up · start now"}
              </Link>
            </div>
            <div className="mt-3 text-center text-[12px] text-muted">
              already inside?{" "}
              <Link to="/signin" className="link-underline">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-[1200px] mx-auto px-6 py-10 flex items-center justify-between flex-wrap gap-3 text-[12px] text-muted">
          <div className="flex items-center gap-2">
            <span className="brand-mark" style={{ width: 22, height: 22, fontSize: 13 }}>R</span>
            <span className="font-semibold text-ink">Recall</span>
            <span>· a memory-first CMO</span>
          </div>
          <div className="mono">Hindsight × Groq × Meta Graph · MemHack '26</div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { title: "Persistent brand memory", body: "Voice, audience, pillars — retained forever, cited on demand." },
  { title: "Post generator", body: "Briefs → three memory-grounded variants with copy, hashtags, art direction." },
  { title: "Weekly calendar", body: "Editorial 7-day grid; every draft cites its memory." },
  { title: "Analytics & narrative", body: "Metrics that come with an answer. What's working, and why." },
  { title: "Recommendation punch list", body: "Five concrete actions this week, ranked by leverage." },
  { title: "Competitor watch", body: "Rivals filed under competitor:handle. Ask, and it cites." },
  { title: "Trending content", body: "Leaderboards, hashtag frequency, thematic clusters." },
  { title: "One-click publishing", body: "Straight to Facebook Page + Instagram Business." },
  { title: "Multi-turn agent", body: "Groq function-calling loop with 10 tools." },
  { title: "Memory inspector", body: "See what's in Hindsight. Recall or Reflect any question." },
  { title: "Live demo brand", body: "NorthPulse ships with 6 past-post learnings." },
];

function Pillar({ n, name, body }: { n: string; name: string; body: string }) {
  return (
    <article className="reveal-3">
      <div className="flex items-baseline gap-3">
        <span className="serif text-[48px] text-brand-deep leading-none tracking-tighter2">{n}</span>
        <span className="text-[11px] uppercase tracking-widest text-muted font-semibold">Pillar</span>
      </div>
      <h3 className="h2 mt-3">{name}</h3>
      <p className="mt-3 text-[14px] leading-relaxed text-pen">{body}</p>
    </article>
  );
}

function FeatureCard({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="card p-5 hover-lift">
      <div className="flex items-baseline justify-between">
        <div className="mono text-[10.5px] text-muted">№&nbsp;{String(n).padStart(2, "0")}</div>
      </div>
      <h4 className="h3 mt-2 tracking-tighter2">{title}</h4>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}
