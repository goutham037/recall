import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { SearchIcon, SparkleIcon, PlusIcon, BoltIcon, ExternalIcon, RefreshIcon } from "../lib/icons";
import { MemoryDrawer, MemoryDetail } from "../components/MemoryDrawer";
import { MemoryConstellation, MemoryNode, MEMORY_GRAPH_NODES } from "../components/MemoryConstellation";
import { UnderstatedTabs, EvidenceDrawer, TechnicalDetails, ShowMore } from "../components/DisclosurePrimitives";

type MemRow = {
  id: string;
  text: string;
  type?: string;
  tags?: string[];
  score?: number;
};

const CATEGORIES = ["All", "Campaigns", "Content", "Audience", "Competitors", "Learnings"] as const;

export default function Memory() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any | null>(null);
  const [list, setList] = useState<MemRow[]>([]);
  const [recall, setRecall] = useState<MemRow[]>([]);
  const [reflect, setReflect] = useState<{ text: string; based_on: any[] } | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("All");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<MemoryDetail | null>(null);
  const [healthDrawerOpen, setHealthDrawerOpen] = useState(false);

  // Two-way synchronization between Memory Graph and Timeline
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("center-pattern");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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

  useEffect(() => {
    refresh();
  }, []);

  async function doRecall() {
    if (!query) return;
    setBusy(true);
    setErr(null);
    try {
      const tagFilter = activeCategory !== "All" ? [activeCategory.toLowerCase()] : undefined;
      const r = await api.memory.recall(query, tagFilter);
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
    if (!manual.trim()) return;
    setBusy(true);
    try {
      await api.memory.retain(manual, ["learning", "manual-note"]);
      setManual("");
      refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const filteredList = useMemo(() => {
    if (activeCategory === "All") return list;
    const cat = activeCategory.toLowerCase();
    return list.filter((item) => {
      const text = (item.text || "").toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());
      if (cat === "campaigns") return tags.includes("content-plan") || text.includes("drop") || text.includes("launch");
      if (cat === "content") return tags.includes("reel") || tags.includes("carousel") || text.includes("post");
      if (cat === "audience") return tags.includes("audience") || text.includes("cook") || text.includes("save");
      if (cat === "competitors") return tags.some((t) => t.startsWith("competitor:")) || text.includes("competitor");
      if (cat === "learnings") return tags.includes("learning") || text.includes("outperformed") || text.includes("lift");
      return true;
    });
  }, [list, activeCategory]);

  function handleGraphNodeSelect(node: MemoryNode) {
    setSelectedNodeId(node.id);
    setSelectedMemory({
      id: node.id,
      code: node.code,
      title: node.headline,
      category: node.category,
      capturedAt: node.date,
      performance: node.metric,
      pattern: node.takeaway,
      recalledIn: ["Weekly Launch Strategy", "Studio Counter-Programming", "Audience Save-Rate Synthesis"],
      content: `Recorded post outcome: "${node.headline}". Observed save and engagement lift. Stored with persistent Vectorize Hindsight tags.`,
      relatedMemories: node.connections.map((cid) => {
        const match = MEMORY_GRAPH_NODES.find((m) => m.id === cid);
        return {
          id: cid,
          code: match ? match.code : cid,
          label: match ? match.label : `Related Node ${cid}`,
        };
      }),
    });
  }

  const timelineEvents = [
    {
      nodeId: "m1",
      date: "Aug 14, 2026",
      label: "Initial Catalog Push",
      category: "Early Learning",
      metric: "71 saves · 1.2% rate",
      desc: "Static graphics of price reductions yielded low saves despite promotion spend.",
      whyItMatters: "Proved pure price discounting fails to produce durable audience retention.",
      usedIn: "Strategy Pivot Note #0012",
    },
    {
      nodeId: "m3",
      date: "Sep 02, 2026",
      label: "Late-Night Carousel Drop",
      category: "Format Discovery",
      metric: "312 saves · 4.2x lift",
      desc: "Carousel addressing apartment midnight food cravings generated first major save spike.",
      whyItMatters: "Revealed late evening (7:30 – 10:30 PM) is our highest-conversion engagement slot.",
      usedIn: "Calendar Scheduler Rule",
    },
    {
      nodeId: "m2",
      date: "Sep 18, 2026",
      label: "15-Min Emergency Dinner Reel",
      category: "Highest Outlier",
      metric: "480 saves · 34K reach",
      desc: "Story-driven reel solving urgent 'ingredients missing at 9:30 PM' pain generated peak bookmark saves.",
      whyItMatters: "Established the primary formula for all future top-of-funnel video assets.",
      usedIn: "Core Creative Blueprint",
    },
  ];

  return (
    <div className="space-y-8 w-full pb-16">
      {/* 01. Dominant Page Header (Rule 28) */}
      <PageHeader
        eyebrow="DURABLE MEMORY ARCHIVE"
        title={
          <>
            MEMORY <span className="serif-italic text-brand-deep">VAULT.</span>
          </>
        }
        kicker="Everything your agent remembers that still matters."
        right={
          <div className="flex items-center gap-3">
            <span className="pill text-[11px] font-sans py-1 px-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span>{stats?.total_nodes ?? 34} memories indexed</span>
            </span>
          </div>
        }
      />

      {/* Understated Tabs: OVERVIEW | THREAD | ARCHIVE (Rule 69) */}
      <UnderstatedTabs
        tabs={[
          { id: "overview", label: "Overview & Constellation" },
          { id: "thread", label: "Memory Thread" },
          { id: "archive", label: "Browse Archive", count: list.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OVERVIEW (Rule 28 & 29) */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Animated Memory Constellation Graph (Rule 29: Visual Centerpiece) */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between pb-2 border-b border-line">
              <div>
                <span className="mono text-[10.5px] uppercase tracking-wider text-brand-deep font-bold block">
                  KNOWLEDGE CONSTELLATION
                </span>
                <div className="serif text-[20px] text-ink font-medium">
                  See how past moments connect.
                </div>
              </div>
              <span className="text-[12px] text-muted hidden sm:inline">
                Hover a memory to see what it influenced. Click to inspect.
              </span>
            </div>

            <MemoryConstellation
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onSelectNode={handleGraphNodeSelect}
              onHoverNode={setHoveredNodeId}
              heightClass="h-[460px] md:h-[520px]"
              showCard={true}
            />

            <div className="text-[12px] text-muted text-center pt-1 font-sans">
              Hover a memory to see what it influenced.
            </div>
          </div>

          {/* 3 Concise Human Metrics (Rule 32) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 bg-white border border-line shadow-xs">
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">
                Remembered Moments
              </div>
              <div className="serif text-[32px] text-ink font-medium mt-1 leading-none">
                {stats?.total_nodes ?? 34}
              </div>
              <p className="text-[12px] text-muted mt-2">
                Durable moments available for every prompt.
              </p>
            </div>

            <div className="card p-5 bg-white border border-line shadow-xs">
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">
                Connected Relationships
              </div>
              <div className="serif text-[32px] text-brand-deep font-medium mt-1 leading-none">
                {stats?.total_links ?? 193}
              </div>
              <p className="text-[12px] text-muted mt-2">
                Semantic associations linking campaigns to outcomes.
              </p>
            </div>

            <div className="card p-5 bg-white border border-line shadow-xs flex flex-col justify-between">
              <div>
                <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">
                  Learned Patterns
                </div>
                <div className="serif text-[32px] text-ink font-medium mt-1 leading-none">
                  {stats?.total_observations ?? 17}
                </div>
                <p className="text-[12px] text-muted mt-2">
                  Synthesized insights about audience response.
                </p>
              </div>

              <button
                onClick={() => setHealthDrawerOpen(true)}
                className="mt-3 text-[12px] text-brand-deep font-semibold hover:underline text-left"
              >
                View memory health →
              </button>
            </div>
          </div>

          {/* 3-4 Important Learned Patterns Synthesized */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
                CORE LEARNED PATTERNS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5 bg-white border border-line shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[11px] font-bold text-brand-deep">PATTERN #01</span>
                  <span className="mono text-[10.5px] text-brand-deep bg-brand-soft px-2 py-0.5 rounded font-semibold">480 saves</span>
                </div>
                <div className="serif text-[17px] text-ink font-medium leading-snug">
                  Story-Driven Emergency Dinners Outperform Static Graphics
                </div>
                <p className="text-[12.5px] text-muted leading-relaxed">
                  Everyday kitchen emergency solves beat static catalog promotions by 7.1x in bookmark saves.
                </p>
              </div>

              <div className="card p-5 bg-white border border-line shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[11px] font-bold text-brand-deep">PATTERN #02</span>
                  <span className="mono text-[10.5px] text-brand-deep bg-brand-soft px-2 py-0.5 rounded font-semibold">Peak Window</span>
                </div>
                <div className="serif text-[17px] text-ink font-medium leading-snug">
                  Late-Evening Urban Apartment Browsing
                </div>
                <p className="text-[12.5px] text-muted leading-relaxed">
                  Peak save engagement occurs consistently between 7:30 – 10:30 PM IST on weeknights.
                </p>
              </div>
            </div>
          </div>

          {/* Ask Your Memory (Rule 37) */}
          <div className="card p-6 bg-white border border-line shadow-xs space-y-4">
            <div>
              <div className="eyebrow eyebrow-brand">
                <SearchIcon size={12} /> Ask Your Memory
              </div>
              <div className="serif text-[20px] text-ink font-normal mt-1">
                Ask your memory anything.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <input
                className="input text-[13.5px]"
                placeholder="e.g. 'What format got the highest saves?' or 'How do competitors position?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doRecall();
                }}
              />
              <button
                className="btn btn-primary text-[13px]"
                onClick={doRecall}
                disabled={busy || !query.trim()}
              >
                {busy ? "Searching…" : "Recall"}
              </button>
              <button
                className="btn btn-ghost border border-line text-[13px]"
                onClick={doReflect}
                disabled={busy || !query.trim()}
              >
                Find patterns
              </button>
            </div>

            {/* Reflection Synthesized */}
            {reflect && (
              <div className="p-4 bg-brand-soft border border-brand/30 rounded-lg space-y-1.5 reveal">
                <span className="mono text-[10.5px] text-brand-deep font-bold uppercase tracking-wider block">
                  Memory Pattern Synthesis
                </span>
                <p className="text-[13.5px] text-ink leading-relaxed font-sans">{reflect.text}</p>
              </div>
            )}

            {/* Recalled Moments */}
            {recall.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-line reveal">
                <div className="mono text-[11px] text-muted uppercase tracking-wider font-semibold">
                  Retrieved {recall.length} Grounded Context Moments
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recall.map((r, i) => (
                    <div key={i} className="p-3 bg-surface-subtle border border-line rounded text-[13px] text-pen">
                      {r.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <TechnicalDetails
              label="Direct Semantic Retrieval Details"
              data={{
                query,
                vector_bank: "sunshainy-mart",
                results_count: recall.length,
                reflection_available: Boolean(reflect),
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 2: CHRONOLOGICAL THREAD (Rule 33) */}
      {activeTab === "thread" && (
        <div className="card p-6 md:p-8 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              CHRONOLOGICAL MEMORY THREAD
            </span>
            <span className="text-[12px] text-muted">
              Click any event to open lineage
            </span>
          </div>

          <div className="relative pl-6 space-y-5">
            <div className="memory-thread-line" />

            {timelineEvents.map((item) => (
              <div
                key={item.nodeId}
                onClick={() => {
                  const node = MEMORY_GRAPH_NODES.find((n) => n.id === item.nodeId);
                  if (node) handleGraphNodeSelect(node);
                }}
                className="relative flex items-start gap-4 cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 rounded-full mt-1.5 z-10 shrink-0 bg-brand ring-4 ring-brand-soft" />

                <div className="p-4 rounded-lg border border-line bg-surface hover:border-brand/40 flex-1 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="serif text-[17px] text-ink font-medium">
                      {item.label}
                    </div>
                    <span className="mono text-[11px] text-brand-deep font-semibold">
                      {item.date} · {item.metric}
                    </span>
                  </div>

                  <p className="text-[13px] text-pen leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[11.5px] border-t border-line/60">
                    <span className="text-muted">Why it matters: {item.whyItMatters}</span>
                    <button className="text-brand-deep font-semibold hover:underline">
                      Used in decisions →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BROWSE ARCHIVE (Rule 34 & 35) */}
      {activeTab === "archive" && (
        <div className="card p-6 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-line flex-wrap gap-4">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              INDEXED MEMORIES ({filteredList.length})
            </span>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn btn-sm text-[12px] ${
                    activeCategory === cat ? "btn-ink font-semibold" : "btn-ghost border border-line"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Memory Box */}
          <div className="p-4 bg-surface-subtle border border-line rounded-lg flex items-center gap-3">
            <input
              className="input text-[13px] flex-1 bg-white"
              placeholder="Record a new strategic learning or observed audience outcome into Hindsight…"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addManual();
              }}
            />
            <button className="btn btn-sm btn-primary whitespace-nowrap text-[12.5px]" onClick={addManual} disabled={busy || !manual.trim()}>
              <PlusIcon size={12} /> Index Memory
            </button>
          </div>

          {/* Scannable Memory Cards (Rule 35) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.slice(0, 8).map((mem, idx) => (
              <div
                key={mem.id || idx}
                className="card p-4 bg-white border border-line flex flex-col justify-between shadow-xs hover:border-brand/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <span className="mono text-[10.5px] text-muted font-bold">
                      MEMORY / {String(idx + 1).padStart(4, "0")}
                    </span>
                    <span className="mono text-[10.5px] text-brand-deep bg-brand-soft px-1.5 py-0.2 rounded font-semibold">
                      Observation
                    </span>
                  </div>

                  <p className="text-[13px] text-pen leading-relaxed mt-2.5">
                    <ShowMore text={mem.text} maxLength={100} />
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-[12px]">
                  <span className="text-muted mono text-[11px]">Indexed</span>
                  <button
                    onClick={() =>
                      setSelectedMemory({
                        id: mem.id,
                        code: String(idx + 1).padStart(4, "0"),
                        title: mem.text.slice(0, 50) + "…",
                        category: "Observation",
                        capturedAt: "Indexed in Hindsight",
                        performance: "Recorded engagement outcome",
                        pattern: mem.text,
                        recalledIn: ["Weekly Launch Strategy", "Content Calendar Planner"],
                        content: mem.text,
                      })
                    }
                    className="text-brand-deep font-semibold hover:underline"
                  >
                    View memory →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredList.length > 8 && (
            <div className="pt-2 text-center text-muted text-[12.5px] font-mono">
              Showing 8 of {filteredList.length} indexed memories. Use search above for targeted recall.
            </div>
          )}
        </div>
      )}

      {/* Memory Detail Drawer (Rule 31) */}
      <MemoryDrawer
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onSelectRelated={(id) => {
          const target = MEMORY_GRAPH_NODES.find((n) => n.id === id);
          if (target) handleGraphNodeSelect(target);
        }}
      />

      {/* Memory Health Drawer (Rule 32) */}
      <EvidenceDrawer
        isOpen={healthDrawerOpen}
        onClose={() => setHealthDrawerOpen(false)}
        title="Hindsight Memory Health"
        subtitle="Vector storage parameters and connectivity status."
        badge="MEMORY HEALTH"
      >
        <div className="space-y-6">
          <div className="p-4 bg-brand-soft border border-brand/30 rounded-lg flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand" />
            <div>
              <div className="serif text-[16px] text-ink font-semibold">Vector Storage Active</div>
              <div className="text-[12.5px] text-pen">Isolated tenant vector bank connected and healthy.</div>
            </div>
          </div>

          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">Vector Bank:</span>
              <span className="mono font-semibold text-ink">sunshainy-mart</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">Total Moments:</span>
              <span className="mono font-semibold text-brand-deep">{stats?.total_nodes ?? 34}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">Relationships:</span>
              <span className="mono font-semibold text-ink">{stats?.total_links ?? 193}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line">
              <span className="text-muted">Observations:</span>
              <span className="mono font-semibold text-ink">{stats?.total_observations ?? 17}</span>
            </div>
          </div>

          <TechnicalDetails
            label="Raw Engine Specifications"
            data={{
              engine: "Vectorize Hindsight v1",
              vector_dimension: 1536,
              embedding_model: "text-embedding-3-small",
              decay_policy: "Time-aware logarithmic save-rate weighting",
              tenant_isolation: "Isolated namespace 'sunshainy-mart'",
            }}
          />
        </div>
      </EvidenceDrawer>
    </div>
  );
}
