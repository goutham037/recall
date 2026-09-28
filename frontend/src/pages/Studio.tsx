import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead } from "../components/Shell";
import {
  SparkleIcon,
  RefreshIcon,
  PlusIcon,
  ExternalIcon,
  BoltIcon,
} from "../lib/icons";

export default function Studio() {
  return (
    <>
      <PageHead
        eyebrow="Section 06 · The Studio"
        title={
          <>
            Generate. Analyze.{" "}
            <span className="serif-italic text-brand-deep">Recommend.</span>
          </>
        }
        kicker="The workroom. Draft posts grounded in memory, read the numbers with a narrative, and get a punch list for the week — all in one place."
      />

      <Generator />
      <div className="mt-12" />
      <Recommendations />
      <div className="mt-12" />
      <Analytics />
      <div className="mt-12" />
      <Trending />
    </>
  );
}

/* ────────────────────────────────────────────────────── */
/* GENERATOR                                              */
/* ────────────────────────────────────────────────────── */
function Generator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [cta, setCta] = useState("");
  const [channels, setChannels] = useState<string[]>(["instagram", "facebook"]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [grounded, setGrounded] = useState<number>(0);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  async function run(save: boolean) {
    if (!topic.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await api.studio.generate({
        topic,
        channels,
        tone: tone || undefined,
        cta_link: cta || undefined,
        save_as_draft: save,
      });
      setVariants(r.variants || []);
      setGrounded(r.grounded_on_memories || 0);
      if (save) setSavedIds((r.drafted || []).map((d: any) => d.id));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="reveal-3">
      <div className="divider mb-4">
        <span>The Post Generator</span>
      </div>
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
          <div className="md:col-span-2">
            <label className="field-label">The brief · topic</label>
            <input
              className="input"
              placeholder="Trail Hoodie in Cinder colorway, Sunday drop"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Tone (optional)</label>
            <input
              className="input"
              placeholder="warm · scrappy · minimal"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {(["instagram", "facebook"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  setChannels((s) =>
                    s.includes(c) ? s.filter((x) => x !== c) : [...s, c]
                  )
                }
                className={"btn btn-sm " + (channels.includes(c) ? "btn-ink" : "")}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="md:col-span-2">
            <label className="field-label">CTA link (optional)</label>
            <input
              className="input mono"
              placeholder="https://northpulse.example/trail-hoodie"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button className="btn" onClick={() => run(false)} disabled={busy || !topic}>
              <SparkleIcon size={13} /> {busy ? "Composing…" : "Generate 3 variants"}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => run(true)}
              disabled={busy || !topic}
            >
              <PlusIcon size={13} /> Generate + save as drafts
            </button>
          </div>
        </div>
        {err && (
          <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded px-3 py-2">
            {err}
          </div>
        )}
        {variants.length > 0 && (
          <div className="mt-6">
            <div className="dateline">
              Grounded on {grounded} memories · {variants.length} variants
              {savedIds.length > 0 && ` · saved as drafts #${savedIds.join(", #")}`}
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {variants.map((v, i) => (
                <VariantCard key={i} idx={i} v={v} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function VariantCard({ idx, v }: { idx: number; v: any }) {
  const label = ["A · Highest-leverage", "B · New angle", "C · Short & punchy"][idx] || `Variant ${idx + 1}`;
  return (
    <article className="border border-rule p-5 rounded flex flex-col h-full">
      <div className="flex items-baseline justify-between">
        <span className="dateline">{label}</span>
        <span className="mono text-[10px] soft">
          №&nbsp;{String(idx + 1).padStart(2, "0")}
        </span>
      </div>
      <h4 className="h3 mt-2 !text-[16px] leading-snug">{v.hook}</h4>
      <p className="mt-2 text-[13.5px] whitespace-pre-wrap leading-relaxed">
        {v.caption}
      </p>
      <div className="mt-2 mono text-[10.5px] text-brand-deep line-clamp-2">
        {v.hashtags}
      </div>
      {v.cta_link && (
        <a
          href={v.cta_link}
          target="_blank"
          rel="noreferrer"
          className="link-underline text-[12px] mt-2 truncate"
        >
          {v.cta_link}
        </a>
      )}
      {v.rationale && (
        <blockquote className="mt-3 pt-3 border-t border-rule text-[12.5px] muted serif-italic border-l-2 border-brand pl-3 !border-t-0">
          Why now: {v.rationale}
        </blockquote>
      )}
      {v.memory_ref && (
        <div className="mt-2 dateline">cited: “{v.memory_ref}”</div>
      )}
      {v.image_prompt && (
        <div className="mt-3 pt-3 border-t border-rule">
          <div className="eyebrow no-rules mb-1">Art direction</div>
          <div className="text-[12px] muted">{v.image_prompt}</div>
        </div>
      )}
    </article>
  );
}

/* ────────────────────────────────────────────────────── */
/* RECOMMENDATIONS                                        */
/* ────────────────────────────────────────────────────── */
function Recommendations() {
  const [actions, setActions] = useState<any[]>([]);
  const [grounded, setGrounded] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await api.studio.recommendations();
      setActions(r.actions || []);
      setGrounded(r.grounded_on_memories || 0);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    run();
  }, []);

  const badge = (u: string) => {
    if (u === "now") return "tag-bad";
    if (u === "this-week") return "tag-warn";
    return "tag";
  };

  return (
    <section className="reveal-4">
      <div className="divider mb-4">
        <span>The Punch List · this week</span>
      </div>
      <div className="card p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow eyebrow-brand no-rules">
              <BoltIcon size={13} /> Five actions
            </div>
            <div className="h2 mt-2 !text-[24px]">
              Ordered by leverage. Grounded in memory.
            </div>
            <div className="dateline mt-2">
              Grounded on {grounded} memories
            </div>
          </div>
          <button className="btn btn-sm" onClick={run} disabled={busy}>
            <RefreshIcon size={13} /> {busy ? "…" : "Regenerate"}
          </button>
        </div>
        {err && (
          <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded px-3 py-2">
            {err}
          </div>
        )}
        {actions.length === 0 && !busy && !err && (
          <div className="mt-4 text-muted text-sm serif-italic">
            Nothing to recommend yet. Seed the demo brand or add memories.
          </div>
        )}
        <ol className="editorial-list mt-4">
          {actions.map((a, i) => (
            <li key={i}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={"tag mono " + badge(a.urgency)}>
                      {a.urgency || "this-week"}
                    </span>
                  </div>
                  <div className="serif text-[20px] mt-1 leading-snug tracking-editorial">
                    {a.title}
                  </div>
                  <p className="text-[13.5px] muted mt-1 leading-relaxed">
                    {a.why}
                  </p>
                  {a.memory_ref && (
                    <div className="dateline mt-1">
                      cited: “{a.memory_ref}”
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────── */
/* ANALYTICS                                              */
/* ────────────────────────────────────────────────────── */
function Analytics() {
  const [d, setD] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      setD(await api.studio.analytics());
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    run();
  }, []);

  const m = d?.metrics || {};
  const perPillar: Record<string, number> = d?.per_pillar || {};
  const perChannel: Record<string, number> = d?.per_channel || {};
  const maxPillar = Math.max(1, ...Object.values(perPillar).map((n) => Number(n) || 0));

  return (
    <section>
      <div className="divider mb-4">
        <span>The Analytics · what's working</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Posts" value={d?.counts?.posts ?? "—"} highlight />
        <Stat label="Reach" value={fmt(m.reach)} />
        <Stat label="Saved" value={fmt(m.saved)} />
        <Stat label="Engagement" value={fmt(m.engagement)} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="card p-6">
          <div className="eyebrow no-rules mb-3">Volume by pillar</div>
          <div className="space-y-2.5">
            {Object.entries(perPillar).length === 0 && (
              <div className="text-sm muted italic">No content yet.</div>
            )}
            {Object.entries(perPillar).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-ink">{k}</span>
                  <span className="mono muted">{v}</span>
                </div>
                <div className="mt-1 h-[6px] bg-canvas rounded">
                  <div
                    className="h-full bg-brand rounded"
                    style={{ width: `${((Number(v) || 0) / maxPillar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="eyebrow no-rules mb-3">Volume by channel</div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(perChannel).length === 0 && (
              <div className="text-sm muted italic col-span-2">
                No published posts yet.
              </div>
            )}
            {Object.entries(perChannel).map(([k, v]) => (
              <div key={k} className="border border-rule p-4 rounded">
                <div className="dateline">{k}</div>
                <div className="serif text-[44px] leading-none mt-2">
                  {String(v)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Narrative */}
      {d?.narrative?.text && (
        <div className="mt-6 card-heavy p-6">
          <div className="eyebrow eyebrow-brand no-rules">The Editorial</div>
          <div className="h2 mt-2 mb-4 serif-italic !text-[24px]">
            What the numbers actually say.
          </div>
          <div className="text-[14.5px] leading-relaxed whitespace-pre-wrap">
            {d.narrative.text}
          </div>
          {(d.narrative.based_on || []).length > 0 && (
            <div className="mt-4 pt-4 border-t border-ink">
              <div className="dateline mb-2">Citations</div>
              <div className="space-y-1">
                {d.narrative.based_on.map((b: any, i: number) => (
                  <div
                    key={i}
                    className="text-[12.5px] muted border-l-2 border-brand pl-3"
                  >
                    ({b.type}) {b.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {err && (
        <div className="mt-4 text-danger text-sm border border-danger/30 bg-dangerSoft rounded px-3 py-2">
          {err}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <button className="btn btn-sm" onClick={run} disabled={busy}>
          <RefreshIcon size={13} /> {busy ? "…" : "Refresh"}
        </button>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div className={"stat " + (highlight ? "brand" : "")}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? "—"}</div>
    </div>
  );
}

function fmt(n: any) {
  if (typeof n !== "number") return "—";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

/* ────────────────────────────────────────────────────── */
/* TRENDING                                               */
/* ────────────────────────────────────────────────────── */
function Trending() {
  const [d, setD] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      setD(await api.studio.trending());
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    run();
  }, []);

  const maxTag = Math.max(
    1,
    ...(d?.top_hashtags || []).map((x: any) => x.count)
  );

  return (
    <section>
      <div className="divider mb-4">
        <span>The Trending Desk · aggregated from rivals</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="card p-6">
          <div className="eyebrow no-rules mb-3">Top competitor posts · by engagement</div>
          <div className="divide-y divide-rule">
            {(d?.top_posts || []).slice(0, 8).map((p: any) => (
              <div key={p.id} className="py-3">
                <div className="dateline">
                  {p.posted_at ? new Date(p.posted_at).toLocaleDateString() : "—"}{" "}
                  · @{p.handle || "?"}{" "}
                  <span className="mono">
                    · ♥ {p.likes ?? "—"} · ✎ {p.comments ?? "—"}
                  </span>
                </div>
                <div className="text-[13.5px] mt-1 line-clamp-2">
                  {p.caption}
                </div>
                {p.permalink && (
                  <a
                    href={p.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-[12px] inline-flex items-center gap-1 mt-1"
                  >
                    Open <ExternalIcon size={11} />
                  </a>
                )}
              </div>
            ))}
            {(!d?.top_posts || d.top_posts.length === 0) && (
              <div className="text-sm muted italic py-3">
                Nothing tracked yet. Head to Competitors.
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="eyebrow no-rules mb-3">Hashtag frequency</div>
          <div className="space-y-2">
            {(d?.top_hashtags || []).slice(0, 10).map((h: any) => (
              <div key={h.tag}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="mono text-brand-deep">{h.tag}</span>
                  <span className="mono muted">{h.count}</span>
                </div>
                <div className="mt-1 h-[5px] bg-canvas rounded">
                  <div
                    className="h-full bg-ink rounded"
                    style={{ width: `${(h.count / maxTag) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!d?.top_hashtags || d.top_hashtags.length === 0) && (
              <div className="text-sm muted italic">
                Track a competitor and this fills in.
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-rule">
            <div className="eyebrow no-rules mb-3">Themes on the rise</div>
            <div className="flex flex-wrap gap-1.5">
              {(d?.top_themes || []).slice(0, 12).map((t: any) => (
                <span key={t.word} className="tag mono">
                  {t.word} · {t.count}
                </span>
              ))}
              {(!d?.top_themes || d.top_themes.length === 0) && (
                <span className="text-sm muted italic">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {err && (
        <div className="mt-4 text-danger text-sm border border-danger/30 bg-dangerSoft rounded px-3 py-2">
          {err}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <button className="btn btn-sm" onClick={run} disabled={busy}>
          <RefreshIcon size={13} /> {busy ? "…" : "Refresh"}
        </button>
      </div>
    </section>
  );
}
