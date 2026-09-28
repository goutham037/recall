import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead } from "../components/Shell";
import { SearchIcon, PlusIcon, SparkleIcon } from "../lib/icons";

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
  const [reflect, setReflect] = useState<{
    text: string;
    based_on: any[];
  } | null>(null);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  async function refresh() {
    try {
      const [s, l] = await Promise.all([
        api.memory.stats(),
        api.memory.list(50),
      ]);
      setStats(s);
      const items: MemRow[] =
        l.memories || l.results || l.items || l.data || l.units || [];
      setList(items);
    } catch (e: any) {
      setErr(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function doRecall() {
    if (!query) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await api.memory.recall(
        query,
        activeTags.length ? activeTags : undefined
      );
      setRecall((r.results || []).map((x: any) => x));
      setReflect(null);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function doReflect() {
    if (!query) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await api.memory.reflect(query);
      setReflect({ text: r.text, based_on: r.based_on?.memories || [] });
      setRecall([]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function addManual() {
    if (!manual) return;
    setBusy(true);
    try {
      await api.memory.retain(manual, ["manual"]);
      setManual("");
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Section 04 · The Archive"
        title={
          <>
            Everything the desk{" "}
            <span className="serif-italic text-brand-deep">remembers.</span>
          </>
        }
        kicker="Recall returns raw memories, ranked by relevance. Reflect asks Hindsight to synthesize an editorial answer, grounded in those memories, with citations."
      />

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-3 reveal-3">
        <Stat label="Memories" value={stats?.total_nodes ?? "—"} highlight />
        <Stat label="Links" value={stats?.total_links ?? "—"} />
        <Stat label="Documents" value={stats?.total_documents ?? "—"} />
        <Stat label="Observations" value={stats?.total_observations ?? "—"} />
        <Stat label="Facts" value={stats?.nodes_by_fact_type?.fact ?? "—"} />
        <Stat label="Pending" value={stats?.pending_consolidation ?? 0} />
      </section>

      {/* Query bar */}
      <section className="mt-10 reveal-4">
        <div className="card p-6">
          <div className="eyebrow eyebrow-brand no-rules">
            Ask the archive
          </div>
          <div className="h2 mt-2 mb-5">
            Two ways in — <span className="serif-italic">recall</span> or{" "}
            <span className="serif-italic">reflect</span>.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
            <textarea
              className="textarea"
              placeholder="e.g. What kind of post gets the most saves?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="btn h-[44px] self-end md:self-auto"
              onClick={doRecall}
              disabled={busy}
            >
              <SearchIcon size={13} /> Recall
            </button>
            <button
              className="btn btn-primary h-[44px] self-end md:self-auto"
              onClick={doReflect}
              disabled={busy}
            >
              <SparkleIcon size={13} /> Reflect
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((t) => (
              <button
                key={t}
                onClick={() =>
                  setActiveTags((a) =>
                    a.includes(t) ? a.filter((x) => x !== t) : [...a, t]
                  )
                }
                className={
                  "tag mono " +
                  (activeTags.includes(t)
                    ? "!bg-ink !text-canvas !border-ink"
                    : "")
                }
              >
                {t}
              </button>
            ))}
          </div>
          {err && (
            <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded px-3 py-2">
              {err}
            </div>
          )}
        </div>
      </section>

      {/* Reflect result */}
      {reflect && (
        <section className="mt-10 reveal">
          <div className="card-heavy p-8">
            <div className="eyebrow eyebrow-brand no-rules">
              The Editorial · Hindsight-synthesized
            </div>
            <div className="h2 mt-2 mb-6 serif-italic">On the question at hand.</div>
            <div className="text-[16px] leading-[1.65] whitespace-pre-wrap dropcap">
              {reflect.text}
            </div>
            {reflect.based_on?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-ink">
                <div className="eyebrow no-rules mb-3">Citations</div>
                <ol className="editorial-list">
                  {reflect.based_on.map((m: any, i: number) => (
                    <li key={i}>
                      <span className="serif-italic muted text-[13px] mr-1">
                        ({m.type})
                      </span>
                      {m.text}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recall results */}
      {recall.length > 0 && (
        <section className="mt-10 reveal">
          <div className="card p-6">
            <div className="divider mb-4">
              <span>Recall results</span>
            </div>
            <div className="divide-y divide-rule">
              {recall.map((r) => (
                <MemoryRow key={r.id} row={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All memories + manual add */}
      <section className="mt-10 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        <div className="card p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow no-rules">The Archive</div>
              <div className="h2 mt-1 serif-italic">
                Newest first.
              </div>
            </div>
            <button className="btn btn-sm" onClick={refresh}>
              Refresh
            </button>
          </div>
          <div className="divide-y divide-rule">
            {list.length === 0 && (
              <div className="text-sm muted italic py-4">
                Nothing on file yet. Seed the demo, or start chatting.
              </div>
            )}
            {list.map((r) => (
              <MemoryRow key={r.id} row={r} />
            ))}
          </div>
        </div>

        <div className="card p-6 h-fit">
          <div className="eyebrow eyebrow-brand no-rules mb-3">
            <PlusIcon size={13} /> File a note
          </div>
          <p className="text-[13px] muted mb-4">
            Capture a fact you learned outside the chat.
          </p>
          <textarea
            className="textarea"
            placeholder="e.g. Founder Priya joins live IG chats on Sundays."
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button
            className="btn btn-primary w-full mt-3"
            onClick={addManual}
            disabled={busy}
          >
            Retain
          </button>
        </div>
      </section>
    </>
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

function MemoryRow({ row }: { row: MemRow }) {
  const t = row.type || (row as any).fact_type;
  const tone =
    t === "world"
      ? "tag-good"
      : t === "observation"
        ? "tag-warn"
        : t === "experience"
          ? "tag-ink"
          : "";
  return (
    <div className="py-4">
      <div className="flex items-center gap-1.5 flex-wrap">
        {t && <span className={"tag mono " + tone}>{t}</span>}
        {(row.tags || (row as any).entities || [])
          .slice(0, 4)
          .map((x: any, i: number) => (
            <span key={i} className="tag mono">
              {typeof x === "string" ? x : x.name || JSON.stringify(x)}
            </span>
          ))}
        {typeof row.score === "number" && (
          <span className="mono soft text-[10.5px] ml-auto">
            score {row.score.toFixed(2)}
          </span>
        )}
      </div>
      <div className="text-[14.5px] mt-2 leading-relaxed">{row.text}</div>
    </div>
  );
}
