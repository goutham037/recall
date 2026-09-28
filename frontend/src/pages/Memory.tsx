import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { PageHeader, Sparkline } from "../components/Shell";
import { SearchIcon, SparkleIcon, PlusIcon, BoltIcon } from "../lib/icons";

type MemRow = {
  id: string;
  text: string;
  type?: string;
  tags?: string[];
  score?: number;
};

const QUICK_TAGS = [
  "brand-voice",
  "brand-audience",
  "brand-pillar",
  "past-post",
  "high-performer",
  "underperformer",
  "learning",
  "content-plan",
  "conversation",
];

export default function Memory() {
  const [stats, setStats] = useState<any | null>(null);
  const [list, setList] = useState<MemRow[]>([]);
  const [recall, setRecall] = useState<MemRow[]>([]);
  const [reflect, setReflect] = useState<{ text: string; based_on: any[] } | null>(null);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  async function refresh() {
    try {
      const [s, l] = await Promise.all([api.memory.stats(), api.memory.list(50)]);
      setStats(s);
      const items: MemRow[] = l.memories || l.results || l.items || l.data || l.units || [];
      setList(items);
    } catch (e: any) {
      setErr(e.message);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function doRecall() {
    if (!query) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.memory.recall(query, activeTags.length ? activeTags : undefined);
      setRecall((r.results || []).map((x: any) => x));
      setReflect(null);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function doReflect() {
    if (!query) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.memory.reflect(query);
      setReflect({ text: r.text, based_on: r.based_on?.memories || [] });
      setRecall([]);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function addManual() {
    if (!manual) return;
    setBusy(true);
    try { await api.memory.retain(manual, ["manual"]); setManual(""); refresh(); }
    finally { setBusy(false); }
  }

  // Fake activity series for the sparkline — replace with real timestamps later
  const activitySeries = useMemo(() => {
    const n = stats?.total_nodes || 0;
    const seed = Math.max(3, Math.min(24, n));
    return Array.from({ length: 16 }, (_, i) => Math.round(seed * (0.3 + Math.sin(i * 0.7) * 0.4 + Math.random() * 0.3)));
  }, [stats?.total_nodes]);

  return (
    <>
      <PageHeader
        eyebrow="Memory"
        title={<>The archive of <span className="serif-italic text-brand-deep">everything.</span></>}
        kicker="Recall returns raw memories, ranked by relevance. Reflect asks Hindsight to synthesize an answer grounded in those memories, with citations."
      />

      {/* Stats + sparkline */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 reveal-3">
        <StatCard label="Memories" value={stats?.total_nodes ?? "—"} spark={activitySeries} highlight />
        <StatCard label="Links" value={stats?.total_links ?? "—"} />
        <StatCard label="Documents" value={stats?.total_documents ?? "—"} />
        <StatCard label="Observations" value={stats?.total_observations ?? "—"} />
        <StatCard label="Facts" value={stats?.nodes_by_fact_type?.fact ?? "—"} />
        <StatCard label="Pending" value={stats?.pending_consolidation ?? 0} />
      </div>

      {/* Memory graph teaser */}
      <div className="mt-6 card p-5 reveal-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="eyebrow"><span className="dot-lead" /> The Brain</div>
            <div className="h2 mt-1">Memory graph</div>
          </div>
          <span className="pill">
            <span className="dot dot-green" /> live
          </span>
        </div>
        <MemoryGraph stats={stats} />
      </div>

      {/* Query bar */}
      <div className="section-divider">Ask memory</div>
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <textarea
            className="textarea"
            placeholder="e.g. What kind of post gets the most saves?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn h-[44px]" onClick={doRecall} disabled={busy}>
            <SearchIcon size={13} /> Recall
          </button>
          <button className="btn btn-primary h-[44px]" onClick={doReflect} disabled={busy}>
            <SparkleIcon size={13} /> Reflect
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((t) => (
            <button
              key={t}
              onClick={() =>
                setActiveTags((a) =>
                  a.includes(t) ? a.filter((x) => x !== t) : [...a, t]
                )
              }
              className={"tag mono " + (activeTags.includes(t) ? "tag-ink" : "")}
            >
              {t}
            </button>
          ))}
        </div>
        {err && (
          <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
            {err}
          </div>
        )}
      </div>

      {/* Reflect */}
      {reflect && (
        <div className="mt-6 card p-6 reveal">
          <div className="eyebrow"><BoltIcon size={13} /> Reflection · Hindsight-synthesized</div>
          <div className="h2 mt-2 serif-italic mb-4">On the question at hand.</div>
          <div className="text-[15px] leading-[1.68] whitespace-pre-wrap">{reflect.text}</div>
          {reflect.based_on?.length > 0 && (
            <div className="mt-6 pt-5 border-t border-line">
              <div className="eyebrow mb-3">Citations</div>
              <ol className="editorial-list">
                {reflect.based_on.map((m: any, i: number) => (
                  <li key={i}>
                    <span className="serif-italic muted text-[13px] mr-1">({m.type})</span>
                    {m.text}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Recall */}
      {recall.length > 0 && (
        <div className="mt-6 card p-5">
          <div className="eyebrow mb-3">Recall results · {recall.length}</div>
          <div className="divide-y divide-line">
            {recall.map((r) => <MemoryRow key={r.id} row={r} />)}
          </div>
        </div>
      )}

      {/* Archive */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h2">The Archive</div>
              <div className="text-[12.5px] text-muted mt-0.5">Newest first from the Hindsight bank.</div>
            </div>
            <button className="btn btn-sm" onClick={refresh}>Refresh</button>
          </div>
          <div className="divide-y divide-line">
            {list.length === 0 && (
              <div className="text-sm text-muted italic py-4">
                Nothing on file yet. Seed the demo, or start chatting.
              </div>
            )}
            {list.map((r) => <MemoryRow key={r.id} row={r} />)}
          </div>
        </div>

        <div className="card p-5 h-fit">
          <div className="eyebrow eyebrow-brand"><PlusIcon size={13} /> File a note</div>
          <p className="text-[12.5px] text-muted mt-3">
            Capture a fact you learned outside the chat.
          </p>
          <textarea
            className="textarea mt-3"
            placeholder="e.g. Founder Priya joins live IG chats on Sundays."
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button className="btn btn-primary w-full mt-3" onClick={addManual} disabled={busy}>
            Retain
          </button>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label, value, spark, highlight,
}: {
  label: string; value: any; spark?: number[]; highlight?: boolean;
}) {
  return (
    <div className={"stat " + (highlight ? "brand" : "")}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? "—"}</div>
      {spark && spark.length > 1 && (
        <div className="mt-2 -mx-1">
          <Sparkline values={spark} height={30} />
        </div>
      )}
    </div>
  );
}

function MemoryRow({ row }: { row: MemRow }) {
  const t = row.type || (row as any).fact_type;
  const tone = t === "world" ? "tag-brand" : t === "observation" ? "tag-warn" : t === "experience" ? "tag-ink" : "";
  return (
    <div className="py-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {t && <span className={"tag mono " + tone}>{t}</span>}
        {(row.tags || (row as any).entities || []).slice(0, 4).map((x: any, i: number) => (
          <span key={i} className="tag mono">
            {typeof x === "string" ? x : x.name || JSON.stringify(x)}
          </span>
        ))}
        {typeof row.score === "number" && (
          <span className="mono text-soft ml-auto text-[10.5px]">
            score {row.score.toFixed(2)}
          </span>
        )}
      </div>
      <div className="text-[14px] mt-2 leading-relaxed">{row.text}</div>
    </div>
  );
}

/* Simple SVG memory graph — nodes = fact counts, edges = links. Layout on a circle. */
function MemoryGraph({ stats }: { stats: any }) {
  const facts = stats?.nodes_by_fact_type || { fact: 0, observation: 0 };
  const nodes = Math.max(6, Math.min(40, stats?.total_nodes || 12));
  const edges = Math.max(4, Math.min(60, stats?.total_links || 10));
  const w = 900, h = 220, cx = w / 2, cy = h / 2, r = 88;
  const pts = Array.from({ length: nodes }, (_, i) => {
    const a = (i / nodes) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * (r + (i % 3) * 12), y: cy + Math.sin(a) * (r + (i % 3) * 6) };
  });
  const lines: [number, number][] = [];
  for (let e = 0; e < edges; e++) {
    lines.push([e % nodes, (e * 3 + 1) % nodes]);
  }
  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-quiet/40 dotgrid-soft">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[240px]">
        {/* Edges */}
        {lines.map(([a, b], i) => (
          <line
            key={i}
            x1={pts[a].x} y1={pts[a].y}
            x2={pts[b].x} y2={pts[b].y}
            stroke="rgba(52,178,51,0.22)"
            strokeWidth={1}
          />
        ))}
        {/* Nodes */}
        {pts.map((p, i) => {
          const isBrand = i % 4 === 0;
          const rad = 4 + (i % 5);
          return (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={rad + 4}
                fill={isBrand ? "rgba(52,178,51,0.16)" : "rgba(10,10,11,0.06)"}
              />
              <circle
                cx={p.x} cy={p.y} r={rad}
                fill={isBrand ? "#34B233" : "#0A0A0B"}
              />
            </g>
          );
        })}
        {/* Center label */}
        <g transform={`translate(${cx} ${cy})`}>
          <circle r={40} fill="#FFFFFF" stroke="rgba(10,10,11,0.08)" />
          <text textAnchor="middle" y={-2} fontSize={11} fill="#6B6E76" fontFamily="Manrope" letterSpacing={1.6}>
            NODES
          </text>
          <text textAnchor="middle" y={20} fontSize={22} fill="#0A0A0B" fontFamily="Fraunces" letterSpacing={-0.8}>
            {stats?.total_nodes ?? "—"}
          </text>
        </g>
      </svg>
      <div className="absolute bottom-3 left-4 flex items-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="dot dot-green" /> world facts · {facts.fact ?? 0}</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-ink" /> observations · {facts.observation ?? 0}</span>
        <span className="mono">{edges} links</span>
      </div>
    </div>
  );
}
