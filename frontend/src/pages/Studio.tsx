import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader, Sparkline } from "../components/Shell";
import { SparkleIcon, RefreshIcon, PlusIcon, ExternalIcon, BoltIcon } from "../lib/icons";

export default function Studio() {
  return (
    <>
      <PageHeader
        eyebrow="Studio"
        title={<>Generate. Analyze. <span className="serif-italic text-brand-deep">Recommend.</span></>}
        kicker="The workroom. Draft posts grounded in memory, read the numbers with a narrative, and get a punch list for the week — all in one place."
      />
      <Generator />
      <div className="section-divider">The Punch List · this week</div>
      <Recommendations />
      <div className="section-divider">The Analytics · what's working</div>
      <Analytics />
      <div className="section-divider">The Trending Desk · aggregated from rivals</div>
      <Trending />
    </>
  );
}

/* ─── GENERATOR ─────────────────────────────────────────────── */
function Generator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [cta, setCta] = useState("");
  const [channels, setChannels] = useState<string[]>(["instagram", "facebook"]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [grounded, setGrounded] = useState(0);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  async function run(save: boolean) {
    if (!topic.trim()) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.studio.generate({
        topic, channels,
        tone: tone || undefined,
        cta_link: cta || undefined,
        save_as_draft: save,
      });
      setVariants(r.variants || []);
      setGrounded(r.grounded_on_memories || 0);
      if (save) setSavedIds((r.drafted || []).map((d: any) => d.id));
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="card p-6 reveal-3">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="eyebrow eyebrow-brand"><SparkleIcon size={13} /> Post Generator</div>
          <div className="h2 mt-2">Brief in. Three variants out.</div>
        </div>
        <span className="pill">
          <span className="dot dot-green" />
          memory-grounded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
        <div className="md:col-span-2">
          <label className="field-label">Topic · what's the post about</label>
          <input
            className="input"
            placeholder="Trail Hoodie in Cinder colorway, Sunday drop"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Tone</label>
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
          <button className="btn btn-primary" onClick={() => run(true)} disabled={busy || !topic}>
            <PlusIcon size={13} /> Generate + save as drafts
          </button>
        </div>
      </div>
      {err && (
        <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      {variants.length > 0 && (
        <div className="mt-6">
          <div className="text-[12px] text-muted mono mb-3">
            Grounded on {grounded} memories · {variants.length} variants
            {savedIds.length > 0 && ` · saved as drafts #${savedIds.join(", #")}`}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {variants.map((v, i) => <VariantCard key={i} idx={i} v={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function VariantCard({ idx, v }: { idx: number; v: any }) {
  const labels = ["A · Highest-leverage", "B · New angle", "C · Short & punchy"];
  return (
    <article className="card p-5 flex flex-col h-full hover-lift">
      <div className="flex items-center justify-between">
        <span className="tag tag-brand mono">{labels[idx] || `Variant ${idx + 1}`}</span>
        <span className="mono text-[10.5px] text-soft">
          №&nbsp;{String(idx + 1).padStart(2, "0")}
        </span>
      </div>
      <h4 className="h3 mt-3 leading-snug tracking-tighter2">{v.hook}</h4>
      <p className="mt-2 text-[13.5px] whitespace-pre-wrap leading-relaxed">{v.caption}</p>
      <div className="mt-2 mono text-[11px] text-brand-deep line-clamp-2">{v.hashtags}</div>
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
        <blockquote className="mt-3 pt-3 border-t border-line pl-3 border-l-2 border-brand !border-t-0 text-[12.5px] text-muted italic">
          Why now: {v.rationale}
        </blockquote>
      )}
      {v.memory_ref && (
        <div className="mt-2 text-[11px] text-muted mono">cited: "{v.memory_ref}"</div>
      )}
      {v.image_prompt && (
        <div className="mt-3 pt-3 border-t border-line">
          <div className="eyebrow mb-1">Art direction</div>
          <div className="text-[12px] text-muted">{v.image_prompt}</div>
        </div>
      )}
    </article>
  );
}

/* ─── RECOMMENDATIONS ───────────────────────────────────────── */
function Recommendations() {
  const [actions, setActions] = useState<any[]>([]);
  const [grounded, setGrounded] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true); setErr(null);
    try {
      const r = await api.studio.recommendations();
      setActions(r.actions || []);
      setGrounded(r.grounded_on_memories || 0);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { run(); }, []);

  const badge = (u: string) => u === "now" ? "tag-bad" : u === "this-week" ? "tag-warn" : "tag-brand";

  return (
    <div className="card p-6 reveal-4">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="eyebrow eyebrow-brand"><BoltIcon size={13} /> Five actions</div>
          <div className="h2 mt-2">Ordered by leverage. Grounded in memory.</div>
          <div className="mono text-[11px] text-muted mt-2">
            Grounded on {grounded} memories
          </div>
        </div>
        <button className="btn btn-sm" onClick={run} disabled={busy}>
          <RefreshIcon size={13} /> {busy ? "…" : "Regenerate"}
        </button>
      </div>
      {err && (
        <div className="text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
          {err}
        </div>
      )}
      {actions.length === 0 && !busy && !err && (
        <div className="text-muted text-sm italic">
          Nothing to recommend yet. Seed the demo brand or add memories.
        </div>
      )}
      <ol className="editorial-list mt-4">
        {actions.map((a, i) => (
          <li key={i}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={"tag mono " + badge(a.urgency)}>
                    {a.urgency || "this-week"}
                  </span>
                </div>
                <div className="serif text-[22px] mt-1 leading-snug tracking-tighter2">
                  {a.title}
                </div>
                <p className="text-[13.5px] text-muted mt-1 leading-relaxed">{a.why}</p>
                {a.memory_ref && (
                  <div className="text-[11px] text-muted mono mt-1">cited: "{a.memory_ref}"</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─── ANALYTICS ─────────────────────────────────────────────── */
function Analytics() {
  const [d, setD] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function run() {
    setBusy(true); setErr(null);
    try { setD(await api.studio.analytics()); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { run(); }, []);

  const m = d?.metrics || {};
  const perPillar: Record<string, number> = d?.per_pillar || {};
  const perChannel: Record<string, number> = d?.per_channel || {};
  const maxPillar = Math.max(1, ...Object.values(perPillar).map((n) => Number(n) || 0));
  const chanEntries = Object.entries(perChannel);
  const chanTotal = chanEntries.reduce((s, [, v]) => s + Number(v || 0), 0);

  const fakeSpark = (i: number) => Array.from({ length: 12 }, (_, k) => Math.max(0, Math.round(3 + Math.sin(k * 0.7 + i) * 3 + Math.random() * 2)));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Posts" value={d?.counts?.posts ?? "—"} spark={fakeSpark(0)} highlight />
        <MetricCard label="Reach" value={fmt(m.reach)} spark={fakeSpark(1)} />
        <MetricCard label="Saved" value={fmt(m.saved)} spark={fakeSpark(2)} />
        <MetricCard label="Engagement" value={fmt(m.engagement)} spark={fakeSpark(3)} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="card p-6">
          <div className="eyebrow mb-4"><span className="dot-lead" /> Volume by pillar</div>
          <div className="space-y-3">
            {Object.entries(perPillar).length === 0 && (
              <div className="text-sm text-muted italic">No content yet.</div>
            )}
            {Object.entries(perPillar).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-ink">{k}</span>
                  <span className="mono text-muted">{v}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${((Number(v) || 0) / maxPillar) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="eyebrow mb-4"><span className="dot-lead" /> Channel split</div>
          {chanEntries.length === 0 ? (
            <div className="text-sm text-muted italic">No published posts yet.</div>
          ) : (
            <div className="flex items-center gap-6">
              <ChannelDonut entries={chanEntries} total={chanTotal || 1} />
              <div className="space-y-1.5">
                {chanEntries.map(([k, v], i) => (
                  <div key={k} className="flex items-center gap-2 text-[13px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: i === 0 ? "var(--brand)" : "var(--ink)" }}
                    />
                    <span className="text-ink">{k}</span>
                    <span className="mono text-muted ml-auto">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {d?.narrative?.text && (
        <div className="mt-6 card-solid p-6">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span className="dot-lead" /> The Editorial
          </div>
          <div className="h2 mt-2 serif-italic text-canvas">
            What the numbers actually say.
          </div>
          <div className="mt-4 text-[15px] leading-[1.65] whitespace-pre-wrap text-canvas/90">
            {d.narrative.text}
          </div>
          {(d.narrative.based_on || []).length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="mono text-[11px] tracking-widest text-canvas/50 uppercase mb-3">Citations</div>
              <div className="space-y-2">
                {d.narrative.based_on.map((b: any, i: number) => (
                  <div key={i} className="text-[12.5px] text-canvas/70 border-l-2 border-brand pl-3">
                    ({b.type}) {b.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {err && (
        <div className="mt-4 text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
          {err}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <button className="btn btn-sm" onClick={run} disabled={busy}>
          <RefreshIcon size={13} /> {busy ? "…" : "Refresh"}
        </button>
      </div>
    </>
  );
}

function MetricCard({ label, value, spark, highlight }: { label: string; value: any; spark?: number[]; highlight?: boolean; }) {
  return (
    <div className={"stat " + (highlight ? "brand" : "")}>
      <div className="flex items-start justify-between">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value ?? "—"}</div>
        </div>
        {spark && (
          <div className="w-16">
            <Sparkline values={spark} width={64} height={28} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelDonut({ entries, total }: { entries: [string, number][]; total: number; }) {
  const R = 44, r = 30, cx = 54, cy = 54;
  let acc = 0;
  const segs = entries.map(([, v], i) => {
    const val = Number(v || 0);
    const frac = val / total;
    const start = acc * Math.PI * 2 - Math.PI / 2;
    acc += frac;
    const end = acc * Math.PI * 2 - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + Math.cos(start) * R, y1 = cy + Math.sin(start) * R;
    const x2 = cx + Math.cos(end) * R, y2 = cy + Math.sin(end) * R;
    const x3 = cx + Math.cos(end) * r, y3 = cy + Math.sin(end) * r;
    const x4 = cx + Math.cos(start) * r, y4 = cy + Math.sin(start) * r;
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
    return { d, color: i === 0 ? "#34B233" : "#0A0A0B" };
  });
  return (
    <svg width={108} height={108} viewBox="0 0 108 108">
      {segs.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
      <circle cx={cx} cy={cy} r={r - 6} fill="var(--surface)" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontFamily="Fraunces" fontSize={22} fill="var(--ink)" letterSpacing={-0.8}>
        {total}
      </text>
    </svg>
  );
}

function fmt(n: any) {
  if (typeof n !== "number") return "—";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

/* ─── TRENDING ──────────────────────────────────────────────── */
function Trending() {
  const [d, setD] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function run() {
    setBusy(true); setErr(null);
    try { setD(await api.studio.trending()); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { run(); }, []);

  const maxTag = Math.max(1, ...(d?.top_hashtags || []).map((x: any) => x.count));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
      <div className="card p-6">
        <div className="eyebrow mb-4"><span className="dot-lead" /> Top competitor posts · by engagement</div>
        <div className="divide-y divide-line">
          {(d?.top_posts || []).slice(0, 8).map((p: any) => (
            <div key={p.id} className="py-3">
              <div className="text-[11px] mono text-muted">
                {p.posted_at ? new Date(p.posted_at).toLocaleDateString() : "—"}{" "}
                · @{p.handle || "?"}{" "}
                <span className="text-soft">
                  · ♥ {p.likes ?? "—"} · ✎ {p.comments ?? "—"}
                </span>
              </div>
              <div className="text-[13.5px] mt-1 line-clamp-2">{p.caption}</div>
              {p.permalink && (
                <a href={p.permalink} target="_blank" rel="noreferrer" className="link-underline text-[12px] inline-flex items-center gap-1 mt-1">
                  Open <ExternalIcon size={11} />
                </a>
              )}
            </div>
          ))}
          {(!d?.top_posts || d.top_posts.length === 0) && (
            <div className="text-sm text-muted italic py-3">
              Nothing tracked yet. Head to Competitors.
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="eyebrow mb-4"><span className="dot-lead" /> Hashtag frequency</div>
        <div className="space-y-2.5">
          {(d?.top_hashtags || []).slice(0, 10).map((h: any) => (
            <div key={h.tag}>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="mono text-brand-deep">{h.tag}</span>
                <span className="mono text-muted">{h.count}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill ink" style={{ width: `${(h.count / maxTag) * 100}%` }} />
              </div>
            </div>
          ))}
          {(!d?.top_hashtags || d.top_hashtags.length === 0) && (
            <div className="text-sm text-muted italic">
              Track a competitor and this fills in.
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-line">
          <div className="eyebrow mb-3"><span className="dot-lead" /> Themes on the rise</div>
          <div className="flex flex-wrap gap-1.5">
            {(d?.top_themes || []).slice(0, 12).map((t: any) => (
              <span key={t.word} className="tag mono">
                {t.word} · {t.count}
              </span>
            ))}
            {(!d?.top_themes || d.top_themes.length === 0) && (
              <span className="text-sm text-muted italic">—</span>
            )}
          </div>
        </div>
      </div>
      {err && (
        <div className="col-span-full text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
          {err}
        </div>
      )}
      <div className="col-span-full flex justify-end">
        <button className="btn btn-sm" onClick={run} disabled={busy}>
          <RefreshIcon size={13} /> {busy ? "…" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
