import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

function todayLine() {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Landing() {
  const { session } = useAuth();
  const primary = session ? "/app/chat" : "/signup";
  const secondary = session ? "/signup" : "/signin";
  return (
    <div className="min-h-screen grain-mask">
      {/* Public masthead */}
      <header className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-8 pt-6 pb-4 flex items-baseline justify-between">
          <div className="dateline">
            Vol. 01 &nbsp;·&nbsp; Issue 01 &nbsp;·&nbsp; {todayLine()}
          </div>
          <div className="dateline">MemHack '26 · Hindsight × Groq × Meta</div>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 pt-4 pb-8 text-center">
          <div className="masthead-title !text-[92px] leading-[0.85] reveal">
            Recall
          </div>
          <div className="mono uppercase tracking-[0.3em] text-[10.5px] muted mt-3 reveal-1">
            The Marketing Desk
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-8 pb-4">
          <div className="hr-ink" />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-8 pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-14 items-start">
          <div>
            <div className="eyebrow eyebrow-brand reveal">The Cover Story</div>
            <h1 className="h1 !text-[72px] mt-5 reveal-1 leading-[0.95]">
              A memory-first CMO,
              <br />
              <span className="serif-italic text-brand-deep">
                filed at your desk.
              </span>
            </h1>
            <p className="mt-6 text-[16.5px] leading-[1.7] text-pen max-w-xl reveal-2">
              Stateless chatbots forget. Recall doesn't. Every conversation,
              every published post, every performance metric and every rival
              move is retained in{" "}
              <span className="text-ink font-semibold">Hindsight</span> and
              cited by the next answer. Ask it{" "}
              <span className="serif-italic">why</span> — it reads from the
              file.
            </p>
            <div className="mt-8 flex items-center gap-3 reveal-3">
              <Link to={primary} className="btn btn-primary text-[14px] px-5">
                {session ? "Enter the desk →" : "Start the demo →"}
              </Link>
              <Link to={secondary} className="btn text-[14px] px-5">
                {session ? "Sign up someone else" : "I have an account"}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 dateline reveal-4">
              <span>Free during MemHack</span>
              <span className="w-1 h-1 rounded-full bg-ruleStrong" />
              <span>60-second setup</span>
              <span className="w-1 h-1 rounded-full bg-ruleStrong" />
              <span>Real Meta publishing</span>
            </div>
          </div>

          {/* Editorial mock */}
          <aside className="reveal-4">
            <div className="card p-6 relative">
              <div className="dateline">A dispatch, filed Sunday 8pm IST</div>
              <div className="mt-3 serif text-[24px] leading-[1.15] tracking-editorial">
                “The <span className="serif-italic">'kilometre 8 hurts'</span>{" "}
                reel got 21K reach and 340 saves — 2× your usual save-rate. I'd
                run the sequel this Sunday.”
              </div>
              <div className="mt-4 pt-4 border-t border-rule">
                <div className="dateline mb-2">Cited from memory</div>
                <div className="text-[12.5px] muted leading-relaxed border-l-2 border-brand pl-3">
                  Reel 'kilometre 8 hurts, we made this for what comes after'
                  scored 21K reach, 340 saves, 6.1% engagement.{" "}
                  <span className="mono">past-post · high-performer</span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5">
                <span className="tag tag-good mono">recall_memory</span>
                <span className="tag tag-good mono">reflect_on_memory</span>
                <span className="tag mono">plan_calendar</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 justify-end">
              <span className="dot dot-green" />
              <span className="dateline">live from the archive</span>
            </div>
          </aside>
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-t border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-8 py-14">
          <div className="divider mb-8">
            <span>The Three Pillars</span>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Pillar
              n="01"
              name="Memory"
              body="Every fact, every past post, every learning is retained in Hindsight. The agent recalls what worked and cites it in every recommendation."
              tools={["recall_memory", "reflect_on_memory", "remember"]}
            />
            <Pillar
              n="02"
              name="Publishing"
              body="One-click posts to Facebook Page + Instagram Business through the Meta Graph API. Insights come back and get filed as new memories."
              tools={["publish_post", "fetch_performance"]}
            />
            <Pillar
              n="03"
              name="Insights"
              body="Analytics grounded in narrative. Ask 'why is the Coach's Corner pillar working?' and get a synthesized answer with citations."
              tools={["reflect", "recommendations", "trending"]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-14">
            <div>
              <div className="eyebrow eyebrow-brand">How it works</div>
              <h2 className="h1 !text-[52px] mt-5">
                Five acts,{" "}
                <span className="serif-italic text-brand-deep">
                  and it's yours.
                </span>
              </h2>
              <p className="mt-4 text-[15px] muted leading-relaxed max-w-md">
                A memory-first workflow that gets sharper each cycle.
              </p>
            </div>
            <ol className="editorial-list">
              <li>
                <b>Onboard the brand.</b> Voice, audience, pillars — filed as
                durable memories.
              </li>
              <li>
                <b>Ask for a plan.</b> Every draft carries a{" "}
                <span className="serif-italic">Why now</span> citing the
                memory it leaned on.
              </li>
              <li>
                <b>Publish.</b> One click ships to FB + IG. The post itself
                becomes a memory.
              </li>
              <li>
                <b>Fetch performance.</b> Insights come back as retained
                learnings.
              </li>
              <li>
                <b>Ask again.</b> The next answer is grounded in the last
                cycle's results. Smarter every turn.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-ink">
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <div className="divider mb-8">
            <span>Eleven things Recall does</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FeatureRow key={f.title} n={i + 1} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-paper border-t border-ink">
        <div className="max-w-[1000px] mx-auto px-8 py-20 text-center">
          <div className="eyebrow eyebrow-brand justify-center">
            The New Craft
          </div>
          <blockquote className="mt-6 serif text-[36px] md:text-[44px] leading-[1.15] tracking-editorial">
            Marketing was <span className="serif-italic">institutional
            memory</span> before it was software. Recall is the software of the
            memory.
          </blockquote>
          <div className="mt-6 dateline">— The Marketing Desk, Vol. 01</div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink">
        <div className="max-w-[1200px] mx-auto px-8 py-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="eyebrow eyebrow-brand">Get access</div>
            <h2 className="h1 !text-[56px] mt-4">
              Open the desk in{" "}
              <span className="serif-italic text-brand-deep">60 seconds.</span>
            </h2>
            <p className="mt-4 text-[15px] muted leading-relaxed max-w-lg">
              Sign up with any email. This is a hackathon demo — no
              verification, no card, no waiting list.
            </p>
          </div>
          <div className="card p-6">
            <div className="dateline">Free during MemHack</div>
            <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed">
              <li>· Persistent brand memory in Hindsight</li>
              <li>· Groq-driven agent with function calling</li>
              <li>· Real Meta Graph publishing</li>
              <li>· Post generator + weekly calendar</li>
              <li>· Analytics, trending, and recommendations</li>
            </ul>
            <div className="mt-5 flex gap-2">
              <Link
                to={primary}
                className="btn btn-primary w-full justify-center"
              >
                {session ? "Open the desk" : "Sign up · start now"}
              </Link>
            </div>
            <div className="mt-3 dateline text-center">
              already inside?{" "}
              <Link to="/signin" className="link-underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink">
        <div className="max-w-[1200px] mx-auto px-8 py-8 flex flex-wrap items-baseline justify-between gap-4">
          <div className="serif text-2xl">Recall</div>
          <div className="dateline">
            Set in Instrument Serif &amp; Instrument Sans · Data in JetBrains Mono
          </div>
          <div className="dateline">Hindsight × Groq × Meta Graph API</div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: "Persistent brand memory",
    body: "Voice, audience, pillars — retained forever, cited on demand.",
  },
  {
    title: "Post generator",
    body: "Briefs → three memory-grounded variants with copy, hashtags, art direction.",
  },
  {
    title: "Weekly calendar",
    body: "Editorial 7-day grid, drag-scheduled, memory-cited drafts.",
  },
  {
    title: "Analytics & narrative",
    body: "Metrics that come with an answer. What's working, and why.",
  },
  {
    title: "Recommendation punch list",
    body: "5 concrete actions this week, ranked by leverage.",
  },
  {
    title: "Competitor watch",
    body: "Rivals filed under competitor:handle. Ask, and it cites.",
  },
  {
    title: "Trending content",
    body: "Leaderboards, hashtag frequency, and thematic clusters.",
  },
  {
    title: "One-click publishing",
    body: "Straight to Facebook Page + Instagram Business, with insights fed back.",
  },
  {
    title: "Multi-turn agent",
    body: "Groq function-calling loop with 10 tools — plan, publish, learn.",
  },
  {
    title: "Memory inspector",
    body: "See what's in Hindsight. Recall or Reflect any question.",
  },
  {
    title: "Live demo brand",
    body: "NorthPulse ships with 6 past-post learnings, ready to demo.",
  },
];

function Pillar({
  n,
  name,
  body,
  tools,
}: {
  n: string;
  name: string;
  body: string;
  tools: string[];
}) {
  return (
    <article>
      <div className="flex items-baseline gap-3">
        <span className="serif text-[46px] text-brand-deep leading-none">
          {n}
        </span>
        <span className="dateline">Pillar</span>
      </div>
      <h3 className="h2 mt-3">{name}</h3>
      <p className="mt-3 text-[14px] leading-relaxed text-pen">{body}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <span key={t} className="tag mono">
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

function FeatureRow({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-ink pt-4">
      <div className="flex items-baseline justify-between">
        <div className="dateline">
          №&nbsp;{String(n).padStart(2, "0")}
        </div>
        <span className="ornament">⁂</span>
      </div>
      <h4 className="serif text-[22px] mt-2 leading-tight tracking-editorial">
        {title}
      </h4>
      <p className="mt-1 text-[13.5px] muted leading-relaxed">{body}</p>
    </div>
  );
}
