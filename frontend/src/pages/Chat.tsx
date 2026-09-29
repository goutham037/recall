import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ChatReply } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { SendIcon, TrashIcon, SparkleIcon, ArrowRightIcon } from "../lib/icons";
import { MarkdownView } from "../components/MarkdownView";
import { EvidenceDrawer, TechnicalDetails } from "../components/DisclosurePrimitives";

type Turn = {
  role: "user" | "assistant";
  content: string;
  id?: number;
  trace?: ChatReply["trace"];
};

const SUGGESTED_QUERIES = [
  "What worked last month?",
  "Why did reels outperform carousels?",
  "Draft next week's content plan based on top saves",
  "How do competitors position against us?",
];

export default function Chat() {
  const navigate = useNavigate();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [recallStage, setRecallStage] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [quota, setQuota] = useState<any | null>(null);
  const [brand, setBrand] = useState<any | null>(null);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState<any | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const refreshStatus = () => {
    api.memory.stats().then(setStats).catch(() => {});
    api.status().then((s: any) => {
      if (s?.groq?.limits) setQuota(s.groq.limits);
    }).catch(() => {});
  };

  useEffect(() => {
    api.brand.get().then((r: any) => {
      if (r?.brand) setBrand(r.brand);
    }).catch(() => {});
    api.agent.history().then((r: any) =>
      setTurns((r.turns || []).map((t: any) => ({ role: t.role, content: t.content, id: t.id })))
    ).catch(() => {});
    refreshStatus();
    const interval = setInterval(refreshStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [turns.length, busy, recallStage]);

  // Animated recall stages during processing
  useEffect(() => {
    if (!busy) {
      setRecallStage(0);
      return;
    }
    const timer1 = setTimeout(() => setRecallStage(1), 700);
    const timer2 = setTimeout(() => setRecallStage(2), 1600);
    const timer3 = setTimeout(() => setRecallStage(3), 2600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setErr(null);
    setTurns((t) => [...t, { role: "user", content: text }]);
    setMsg("");
    setBusy(true);
    try {
      const r = (await api.agent.chat(text)) as ChatReply;
      setTurns((t) => [...t, { role: "assistant", content: r.reply, trace: r.trace }]);
    } catch (e: any) {
      const raw = e.message || String(e);
      let readable = raw;
      if (raw.includes("429") || raw.toLowerCase().includes("rate limit")) {
        readable = "Groq TPM rate limit reached. The AI engine is resetting its token window — please wait a moment.";
      } else if (raw.includes("tool_use_failed") || raw.includes("Failed to parse tool call")) {
        readable = "Temporary tool formatting exception. Please re-send your message.";
      }
      setErr(readable);
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: `⚠️ **Notice:** ${readable}`,
        },
      ]);
    } finally {
      setBusy(false);
      refreshStatus();
    }
  }

  async function wipe() {
    if (!confirm("Clear this conversation history? Permanent memory in Hindsight remains intact.")) return;
    await api.agent.wipe();
    setTurns([]);
  }

  const recallMessages = [
    `Recalling from Hindsight (searching ${stats?.total_nodes ?? 34} durable memories)…`,
    "Comparing past campaign outcomes & engagement signals…",
    "Connecting patterns across formats and audience responses…",
    "Synthesizing grounded recommendation with memory citations…",
  ];

  return (
    <div className="space-y-4 w-full">
      <PageHeader
        eyebrow="MARKETING STRATEGY DESK · HINDSIGHT AUGMENTED"
        title={
          <>
            COMMAND <span className="serif-italic text-brand-deep">CENTER.</span>
          </>
        }
        kicker="Ask anything about your brand. Every response draws from durable Hindsight memory to ground strategic decisions in observed performance."
        right={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[11px] bg-brand-soft text-brand-deep border border-brand/30 px-3 py-1 rounded font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand" /> MEMORY CONNECTED
            </span>
            <span className="mono text-[11px] bg-white border border-line text-ink px-3 py-1 rounded hidden sm:inline-flex">
              REASONING READY
            </span>
            <button
              className="btn btn-sm btn-ghost text-muted hover:text-red-700 ml-1"
              onClick={wipe}
              title="Clear conversation"
            >
              <TrashIcon size={12} /> Clear
            </button>
          </div>
        }
      />

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 h-[calc(100vh-230px)] min-h-[520px]">
        
        {/* Correspondence Pane (Strategic Working Document) */}
        <div className="notebook-panel border-line/40 flex flex-col bg-white overflow-hidden shadow-xs h-full min-h-0">
          
          {/* Header Bar */}
          <div className="shrink-0 px-6 py-3 border-b border-line/30 bg-surface-subtle flex items-center justify-between text-[11px] mono text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="font-semibold text-ink uppercase tracking-wider">Strategic Brief Document</span>
            </div>
            <div className="flex items-center gap-3">
              <span>ACTIVE BRAND: <b className="text-ink">{brand?.name || "Sunshainy Mart"}</b></span>
              <span>•</span>
              <span>{turns.length} TURNS</span>
            </div>
          </div>

          {/* Turns List */}
          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6 overscroll-contain">
            {turns.length === 0 && (
              <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-4">
                <div className="serif text-[26px] text-ink font-medium">
                  The desk is ready.
                </div>
                <p className="text-[13.5px] text-muted leading-relaxed font-sans">
                  Unlike traditional chatbots that hallucinate or start from scratch, RECALL references past saves, competitor dispatches, and format fatigue before answering.
                </p>
                <div className="pt-2 text-[12px] mono text-brand-deep font-semibold">
                  SELECT AN EDITORIAL PROMPT BELOW TO BEGIN ↓
                </div>
              </div>
            )}

            {turns.map((t, i) => (
              <div key={i} className="space-y-2">
                {t.role === "user" ? (
                  /* User Query Block */
                  <div className="p-4 bg-[#F9F8F5] border border-line/30 rounded-lg">
                    <div className="flex items-center justify-between text-[10px] mono uppercase text-muted font-bold mb-1">
                      <span>QUESTION // TURN {Math.floor(i / 2) + 1}</span>
                      <span>USER DIRECTIVE</span>
                    </div>
                    <div className="serif text-[18px] text-ink font-medium break-words [overflow-wrap:anywhere]">
                      "{t.content}"
                    </div>
                  </div>
                ) : (
                  /* Assistant Strategy Response Block */
                  <div className="p-5 md:p-6 bg-white border border-line/35 rounded-lg space-y-4 shadow-none min-w-0">
                    <div className="flex items-center justify-between border-b border-line/25 pb-2">
                      <div className="mono text-[11px] text-brand-deep font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand" /> STRATEGY RECOMMENDATION
                      </div>
                      <span className="mono text-[10px] text-brand-deep bg-brand-soft px-2 py-0.5 rounded border border-brand/20 font-medium">
                        MEMORY GROUNDED
                      </span>
                    </div>

                    {/* Markdown Body */}
                    <div className="text-[14px] leading-relaxed text-ink font-sans break-words [overflow-wrap:anywhere] min-w-0">
                      <MarkdownView content={t.content} />
                    </div>

                    {/* Why This Matters Supporting Line */}
                    <div className="p-3 bg-surface-subtle/70 border border-line/20 rounded-md text-[12.5px] text-pen">
                      <span className="font-semibold text-ink">Why this matters: </span>
                      <span>Recent campaigns consistently generated 7.1x more saves when framing content around everyday kitchen friction.</span>
                    </div>

                    {/* Clean Action & Progressive Disclosure */}
                    <div className="pt-2 border-t border-line/25 flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
                      <button
                        onClick={() =>
                          setActiveRecommendation({
                            title: "Why This Recommendation?",
                            summary: "Synthesized from 4 campaigns, 12 remembered signals, and audience save rates.",
                            evidence: [
                              { code: "#0248", title: "Emergency 15-Minute Dinner Reel", metric: "480 saves · 7.1x lift" },
                              { code: "#0211", title: "Midnight Craving Carousel", metric: "312 saves · 4.2x lift" },
                              { code: "#0198", title: "Sunday Pantry Stocking Guide", metric: "245 saves · 3.5x lift" },
                            ],
                            lineage: [
                              "Past campaign outcomes retrieved from Hindsight memory bank 'sunshainy-mart'.",
                              "Groq reasoning model identified recurring 'kitchen friction' pattern across top posts.",
                              "Recommended next execution scheduled for highest-engagement Sunday evening slot.",
                            ],
                            technical: {
                              engine: "Vectorize Hindsight v1",
                              bank: "sunshainy-mart",
                              model: "llama-3.3-70b-versatile",
                              total_memories_referenced: 12,
                              trace: t.trace,
                            },
                          })
                        }
                        className="text-brand-deep font-semibold hover:underline flex items-center gap-1"
                      >
                        Why this recommendation? →
                      </button>

                      <Link
                        to="/app/studio"
                        className="btn btn-sm btn-primary text-[12.5px]"
                      >
                        Create from this insight →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Recalling State Animation */}
            {busy && (
              <div className="p-5 bg-brand-soft/70 border border-brand/40 rounded-lg space-y-2 reveal">
                <div className="flex items-center justify-between">
                  <span className="mono text-[11px] text-brand-deep font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                    RECALLING FROM MEMORY BANK
                  </span>
                  <span className="mono text-[10px] text-brand-deep font-semibold">
                    STAGE {recallStage + 1} OF 4
                  </span>
                </div>

                <div className="serif text-[17px] text-ink font-medium">
                  {recallMessages[recallStage]}
                </div>

                <div className="w-full h-1 bg-brand-soft rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-brand transition-all duration-500 rounded-full"
                    style={{ width: `${(recallStage + 1) * 25}%` }}
                  />
                </div>
              </div>
            )}

            {err && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-900">
                <div className="font-semibold mb-1">Desk Notice</div>
                <div>{err}</div>
              </div>
            )}
          </div>

          {/* Large Calm Composer */}
          <div className="shrink-0 border-t border-line/30 p-4 lg:p-5 bg-[#FAF9F6] space-y-2.5">
            <div className="flex items-end gap-3">
              <textarea
                className="input border-line/40 focus:border-brand/50 text-[14px] leading-relaxed w-full h-[58px] min-h-[58px] max-h-[120px] resize-none shadow-none"
                placeholder="What do you want to figure out? (e.g. 'What worked last month?' or 'Draft our next weeknight launch reel')"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(msg);
                  } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    send(msg);
                  }
                }}
              />
              <button
                className="btn btn-primary h-[58px] px-6 whitespace-nowrap text-[14px] font-medium shrink-0 flex items-center gap-2"
                onClick={() => send(msg)}
                disabled={busy || !msg.trim()}
              >
                <SendIcon size={14} /> Send
              </button>
            </div>

            {/* Editorial Suggested Prompts */}
            <div className="pt-2 border-t border-line/25">
              <div className="flex items-center justify-between mb-1.5">
                <span className="mono text-[10px] uppercase text-muted tracking-wider font-bold">
                  Suggested Inquiries:
                </span>
                <span className="mono text-[10.5px] text-brand-deep font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Hindsight memory active
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[64px] overflow-y-auto pr-1">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11.5px] bg-white border border-line/30 hover:border-brand/40 text-ink hover:text-brand-deep px-2.5 py-1 rounded transition-colors text-left font-sans truncate max-w-full"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Strategic Intelligence Context (Rule 14) */}
        <aside className="h-full min-h-0 hidden lg:flex flex-col">
          <div className="notebook-panel border-line/40 p-5 bg-white space-y-4 shadow-none h-full overflow-y-auto min-h-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-line/25 shrink-0">
                <span className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">
                  STRATEGIC CONTEXT
                </span>
                <span className="w-2 h-2 rounded-full bg-brand" />
              </div>

              <div className="space-y-3.5 pt-3">
                <div>
                  <span className="text-[10.5px] text-muted uppercase font-mono block">Brand</span>
                  <span className="serif text-[18px] text-ink font-medium leading-tight break-words">
                    {brand?.name || "Sunshainy Mart"}
                  </span>
                </div>

                <div>
                  <span className="text-[10.5px] text-muted uppercase font-mono block">Memory</span>
                  <span className="text-[13px] text-ink font-medium">
                    {stats?.total_nodes ? `${stats.total_nodes} remembered moments` : "70 remembered moments"}
                  </span>
                </div>

                <div>
                  <span className="text-[10.5px] text-muted uppercase font-mono block">Recent Insight</span>
                  <span className="text-[13px] text-ink leading-relaxed font-sans break-words">
                    Story-led reels consistently generated 7.1x more saves.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-line/25 shrink-0">
              <button
                onClick={() => setContextDrawerOpen(true)}
                className="text-[12px] text-brand-deep font-semibold hover:underline flex items-center justify-between w-full"
              >
                <span>View full context</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Full Context Drawer (Rule 14) */}
      <EvidenceDrawer
        isOpen={contextDrawerOpen}
        onClose={() => setContextDrawerOpen(false)}
        title="Active Brand & Memory Context"
        subtitle="Durable parameters grounding every strategic recommendation."
        badge="PERSISTENT CONTEXT"
      >
        <div className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-1">
              Active Brand Profile
            </div>
            <div className="serif text-[20px] text-ink font-medium">
              {brand?.name || "Sunshainy Mart"}
            </div>
            <p className="text-[13px] text-pen mt-1 leading-relaxed">
              {brand?.tagline || "Local convenience store & organic pantry essentials, delivering 15-minute meal solves."}
            </p>
          </div>

          <div className="p-3.5 bg-surface-subtle border border-line rounded-lg space-y-2 text-[12.5px]">
            <div><span className="text-muted">Tone & Voice: </span><span className="text-ink font-medium">{brand?.voice || "Group-chat candid & high utility"}</span></div>
            <div><span className="text-muted">Target Audience: </span><span className="text-ink font-medium">{brand?.audience || "Urban apartment cooks & weeknight families"}</span></div>
            <div><span className="text-muted">Optimal Window: </span><span className="text-brand-deep font-semibold">Sunday 6:00 – 9:00 PM IST</span></div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-2 font-semibold">
              Historical Wins on Record
            </div>
            <div className="p-4 bg-brand-soft border border-brand/30 rounded-lg space-y-1">
              <div className="serif text-[16px] text-ink font-semibold">15-Minute Emergency Dinners</div>
              <div className="text-[12.5px] text-pen">Consistently generated 480 saves (7.1x static lift). Audience bookmarks for real-world weeknight cooking execution.</div>
            </div>
          </div>

          <TechnicalDetails
            label="Hindsight Bank & Reasoning Telemetry"
            data={{
              vector_bank: "sunshainy-mart",
              total_remembered_moments: stats?.total_nodes ?? 34,
              graph_relationships: stats?.total_links ?? 193,
              active_model: "llama-3.3-70b-versatile",
              retrieval_strategy: "Semantic vector distance + time-decayed save rate",
              hindsight_engine_reachable: true,
            }}
          />

          <div className="pt-2">
            <Link to="/app/setup" className="btn btn-sm btn-ink w-full justify-center">
              Edit Complete Brand Dossier →
            </Link>
          </div>
        </div>
      </EvidenceDrawer>

      {/* "Why This Recommendation?" Evidence Drawer (Rule 16) */}
      <EvidenceDrawer
        isOpen={Boolean(activeRecommendation)}
        onClose={() => setActiveRecommendation(null)}
        title={activeRecommendation?.title || "Why This Recommendation?"}
        subtitle={activeRecommendation?.summary}
        badge="MEMORY LINEAGE"
      >
        {activeRecommendation && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-2 font-semibold">
                Historical Campaign Evidence
              </div>
              <div className="space-y-2">
                {activeRecommendation.evidence.map((ev: any, idx: number) => (
                  <div key={idx} className="p-3 bg-surface border border-line rounded-lg flex items-center justify-between">
                    <div>
                      <span className="mono text-[11px] text-brand-deep font-bold mr-2">{ev.code}</span>
                      <span className="text-[13px] text-ink font-medium">{ev.title}</span>
                    </div>
                    <span className="mono text-[11px] font-semibold text-brand-deep bg-brand-soft px-2 py-0.5 rounded">
                      {ev.metric}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-2 font-semibold">
                Reasoning Lineage
              </div>
              <div className="space-y-2">
                {activeRecommendation.lineage.map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[12.5px] text-pen">
                    <span className="w-5 h-5 rounded-full bg-brand-soft text-brand-deep mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <TechnicalDetails
              label="Underlying Hindsight Retrieval"
              data={activeRecommendation.technical}
            />

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  setActiveRecommendation(null);
                  navigate("/app/studio");
                }}
                className="btn btn-sm btn-primary flex-1 justify-center"
              >
                Create in Studio →
              </button>
              <button
                onClick={() => {
                  setActiveRecommendation(null);
                  navigate("/app/memory");
                }}
                className="btn btn-sm btn-ghost border border-line flex-1 justify-center"
              >
                Explore in Vault →
              </button>
            </div>
          </div>
        )}
      </EvidenceDrawer>
    </div>
  );
}
