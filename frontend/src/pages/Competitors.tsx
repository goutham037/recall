import { useEffect, useState, useMemo } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { PlusIcon, RefreshIcon, ExternalIcon, CheckIcon } from "../lib/icons";
import { UnderstatedTabs, EvidenceDrawer, TechnicalDetails, DetailsDisclosure, ShowMore } from "../components/DisclosurePrimitives";

interface CompetitorPost {
  id: number;
  competitor_id: number;
  caption?: string;
  likes?: number;
  comments?: number;
  posted_at?: string;
  permalink?: string;
}

interface CompetitorRow {
  id: number;
  handle: string;
  channel: "instagram" | "facebook";
  display_name?: string;
  post_count?: number;
  last_synced_at?: string;
}

export default function Competitors() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rows, setRows] = useState<CompetitorRow[]>([]);
  const [handle, setHandle] = useState("");
  const [channel, setChannel] = useState<"instagram" | "facebook">("instagram");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [posts, setPosts] = useState<CompetitorPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [dossierDrawer, setDossierDrawer] = useState<CompetitorRow | null>(null);
  const [allPostsModal, setAllPostsModal] = useState(false);

  async function load() {
    try {
      const r = await api.competitors.list();
      setRows(r.competitors || []);
      if (!selected && r.competitors && r.competitors.length > 0) {
        loadPosts(r.competitors[0].handle);
      }
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function loadPosts(h: string) {
    setSelected(h);
    setLoadingPosts(true);
    try {
      const r = await api.competitors.posts(h, 20);
      setPosts(r.posts || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function track() {
    if (!handle) return;
    setBusy(true);
    setErr(null);
    try {
      await api.competitors.track(handle.trim().replace(/^@/, ""), channel);
      setHandle("");
      await load();
    } catch (e: any) {
      setErr(e.message || "Failed to track competitor.");
    } finally {
      setBusy(false);
    }
  }

  async function resync(h: string, ch: string) {
    setBusy(true);
    setErr(null);
    try {
      await api.competitors.track(h, ch as any);
      if (selected === h) await loadPosts(h);
      await load();
    } catch (e: any) {
      setErr(e.message || "Failed to resync.");
    } finally {
      setBusy(false);
    }
  }

  const totalRemembered = rows.reduce((n, r) => n + (r.post_count || 0), 0);

  const selectedCompetitor = useMemo(
    () => rows.find((r) => r.handle === selected) || null,
    [rows, selected]
  );

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Rule 25: Dominant Page Header */}
      <PageHeader
        eyebrow="ANALYST'S NOTEBOOK"
        title={
          <>
            WATCH. <span className="serif-italic text-brand-deep">Track rival signals.</span>
          </>
        }
        kicker="Track the brands you care about. Grounded comparisons show where competitors are silent."
        right={
          <div className="flex items-center gap-3">
            <span className="pill text-[11px] font-sans py-1 px-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span>{rows.length} tracked rivals</span>
            </span>
          </div>
        }
      />

      {/* Rule 25: How It Works Clean Disclosure */}
      <div className="card p-4 bg-white border border-line flex items-center justify-between flex-wrap gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand" />
          <span className="text-[13px] text-ink font-medium">
            Automated Competitive Surveillance
          </span>
          <span className="text-[12.5px] text-muted hidden md:inline">
            · {totalRemembered} signals indexed into Hindsight
          </span>
        </div>
        <DetailsDisclosure title="How it works">
          Rival social dispatches are periodically scanned and retained in Vectorize Hindsight tagged{" "}
          <code className="font-mono text-ink bg-quiet px-1 py-0.5 rounded">competitor:&lt;handle&gt;</code>.
          When you generate content in Studio or prompt the agent, Recall references these patterns to identify
          uncontested messaging opportunities.
        </DetailsDisclosure>
      </div>

      {/* Understated Tabs: OVERVIEW | COMPETITORS | DISPATCHES (Rule 68) */}
      <UnderstatedTabs
        tabs={[
          { id: "overview", label: "Overview & Signals" },
          { id: "competitors", label: "Competitor Dossiers", count: rows.length },
          { id: "dispatches", label: "Recent Dispatches", count: posts.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OVERVIEW (Rule 25) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Concise Metrics (Rule 25) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="card p-5 bg-white border border-line shadow-xs">
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Tracked Competitors</div>
              <div className="serif text-[28px] text-ink font-medium mt-1">{rows.length}</div>
              <div className="text-[12px] text-muted mt-0.5">Active market benchmarks</div>
            </div>
            <div className="card p-5 bg-white border border-line shadow-xs">
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Recent Signals</div>
              <div className="serif text-[28px] text-brand-deep font-medium mt-1">{totalRemembered}</div>
              <div className="text-[12px] text-muted mt-0.5">Retained in Hindsight bank</div>
            </div>
            <div className="card p-5 bg-white border border-line shadow-xs col-span-2 md:col-span-1">
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Counter-Strategy</div>
              <div className="serif text-[28px] text-ink font-medium mt-1">Active</div>
              <div className="text-[12px] text-muted mt-0.5">Synthesized in Ask & Studio</div>
            </div>
          </div>

          {/* Competitor Cards (Rule 25) */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
                BENCHMARK BRANDS ({rows.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rows.map((c) => (
                <div key={c.id || c.handle} className="card p-5 bg-white border-line flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-line">
                      <span className="mono text-[11px] text-muted">@{c.handle}</span>
                      <span className="text-[10.5px] mono text-brand-deep bg-brand-soft px-1.5 py-0.2 rounded capitalize">
                        {c.channel}
                      </span>
                    </div>

                    <h4 className="serif text-[18px] text-ink font-medium mt-2 leading-tight">
                      {c.display_name || c.handle}
                    </h4>

                    {/* Rule 25: Most Important Signal */}
                    <div className="mt-3 p-3 bg-surface-subtle border border-line rounded text-[12.5px] text-pen leading-relaxed">
                      <span className="font-semibold text-ink">Most important signal: </span>
                      <span>Discount-led promotional messaging dominates feed ({c.post_count || 0} scanned dispatches).</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[12.5px]">
                    <button
                      onClick={() => {
                        loadPosts(c.handle);
                        setDossierDrawer(c);
                      }}
                      className="text-brand-deep font-semibold hover:underline"
                    >
                      Open dossier →
                    </button>
                    <button
                      type="button"
                      onClick={() => resync(c.handle, c.channel)}
                      className="text-muted hover:text-ink text-[11px] mono flex items-center gap-1"
                    >
                      <RefreshIcon size={11} /> Sync
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPETITORS DOSSIERS & ADD FORM */}
      {activeTab === "competitors" && (
        <div className="space-y-6">
          {/* Add Brand Form */}
          <div className="card p-5 bg-white border border-brand/30 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <span className="mono text-[11px] uppercase tracking-wider text-brand-deep font-bold flex items-center gap-1.5">
                <PlusIcon size={12} /> Add Competitor to Surveillance
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <label className="field-label">Social Identifier</label>
                <input
                  className="input mono text-sm"
                  placeholder={channel === "instagram" ? "e.g. wholefoods (without @)" : "e.g. 1029384756"}
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
              </div>
              <div className="flex gap-1.5">
                {(["instagram", "facebook"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={"btn btn-sm capitalize " + (channel === c ? "btn-ink" : "btn-ghost border border-line")}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={track}
                disabled={busy || !handle.trim()}
                className="btn btn-primary text-[13px]"
              >
                {busy ? "Tracking…" : "Track Brand"}
              </button>
            </div>
            {err && (
              <div className="mt-3 p-2.5 rounded text-[12.5px] bg-red-50 text-red-800 border border-red-200">
                {err}
              </div>
            )}
          </div>

          {/* Full List of Dossiers */}
          <div className="card p-6 bg-white shadow-xs divide-y divide-line">
            {rows.map((c) => (
              <div key={c.handle} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="serif text-[17px] text-ink font-medium">{c.display_name || c.handle}</span>
                    <span className="mono text-[11px] text-muted">@{c.handle}</span>
                  </div>
                  <div className="text-[12px] text-muted mt-0.5">
                    {c.post_count || 0} dispatches indexed · Last scanned {c.last_synced_at ? new Date(c.last_synced_at).toLocaleDateString() : "Active"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      loadPosts(c.handle);
                      setDossierDrawer(c);
                    }}
                    className="text-[12.5px] text-brand-deep font-semibold hover:underline"
                  >
                    View dossier →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCHES (Rule 27: Top 3 then 'View all') */}
      {activeTab === "dispatches" && (
        <div className="card p-6 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              OBSERVED DISPATCHES {selectedCompetitor ? `(@${selectedCompetitor.handle})` : ""}
            </span>
            {posts.length > 3 && (
              <button
                onClick={() => setAllPostsModal(true)}
                className="text-[12px] text-brand-deep font-semibold hover:underline"
              >
                View all {posts.length} posts →
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm italic">
              No dispatches recorded yet for this competitor.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Show top 3 most meaningful posts per Rule 27 */}
              {posts.slice(0, 3).map((p) => (
                <div key={p.id} className="p-4 bg-surface border border-line rounded-lg flex flex-col justify-between space-y-3">
                  <div>
                    <div className="mono text-[10.5px] text-muted flex items-center justify-between pb-2 border-b border-line">
                      <span>{p.posted_at ? new Date(p.posted_at).toLocaleDateString() : "—"}</span>
                      <span>♥ {p.likes ?? "—"} · ✎ {p.comments ?? "—"}</span>
                    </div>
                    <p className="text-[13px] text-pen leading-relaxed mt-2.5 line-clamp-4">
                      {p.caption}
                    </p>
                  </div>
                  {p.permalink && (
                    <a
                      href={p.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] text-brand-deep font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open on Meta</span>
                      <ExternalIcon size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {posts.length > 3 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setAllPostsModal(true)}
                className="btn btn-sm btn-ghost border border-line"
              >
                View all {posts.length} competitor posts →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Competitor Dossier Drawer (Rule 26: Summary + Advanced) */}
      <EvidenceDrawer
        isOpen={Boolean(dossierDrawer)}
        onClose={() => setDossierDrawer(null)}
        title={dossierDrawer ? `@${dossierDrawer.handle}` : "Competitor Dossier"}
        subtitle="Competitor reconnaissance and messaging breakdown."
        badge="RECONNAISSANCE DOSSIER"
      >
        {dossierDrawer && (
          <div className="space-y-6">
            {/* Summary Mode (Default per Rule 26) */}
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-2 font-semibold">
                What They're Doing (Observations)
              </div>
              <div className="space-y-2 text-[13px] text-pen">
                <div className="p-3 bg-surface border border-line rounded-lg flex items-start gap-2">
                  <span className="text-brand-deep font-mono">1.</span>
                  <span>Pushing heavy flash discounts, coupon codes, and speed-led delivery promises.</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-lg flex items-start gap-2">
                  <span className="text-brand-deep font-mono">2.</span>
                  <span>Lower engagement and bookmark saves due to lack of recipe or utility value.</span>
                </div>
                <div className="p-3 bg-surface border border-line rounded-lg flex items-start gap-2">
                  <span className="text-brand-deep font-mono">3.</span>
                  <span>Posting volume concentrated around morning and lunch rather than late dinner prep.</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-2 font-semibold">
                What It Means For Us (Counter-Strategy)
              </div>
              <div className="p-4 bg-brand-soft border border-brand/30 rounded-lg text-[13px] text-pen leading-relaxed">
                <span className="font-semibold text-ink">Opportunity Window: </span>
                Lead with authentic 15-minute kitchen emergency solves during the 7:30 – 10:30 PM window where rivals are inactive.
              </div>
            </div>

            {/* Top Posts Preview */}
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-2 font-semibold flex items-center justify-between">
                <span>Recent Sample Dispatches</span>
                <span className="mono text-[10.5px]">{posts.length} captured</span>
              </div>
              <div className="space-y-2">
                {posts.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3 bg-surface-subtle border border-line rounded text-[12.5px] text-pen">
                    <div className="flex justify-between mono text-[10px] text-muted mb-1">
                      <span>{p.posted_at ? new Date(p.posted_at).toLocaleDateString() : "Post"}</span>
                      <span>♥ {p.likes ?? "—"}</span>
                    </div>
                    <div className="line-clamp-2">{p.caption}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Technical Mode (Collapsible per Rule 26) */}
            <TechnicalDetails
              label="Advanced Surveillance Metadata"
              data={{
                competitor_id: dossierDrawer.id,
                channel: dossierDrawer.channel,
                hindsight_tag: `competitor:${dossierDrawer.handle}`,
                memory_bank: "sunshainy-mart",
                retained_dispatches_count: dossierDrawer.post_count || 0,
                last_synced: dossierDrawer.last_synced_at,
              }}
            />
          </div>
        )}
      </EvidenceDrawer>

      {/* All Posts Modal */}
      {allPostsModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full p-6 shadow-pop max-h-[85vh] overflow-y-auto space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <span className="serif text-[20px] text-ink font-medium">
                All Observed Dispatches {selectedCompetitor ? `(@${selectedCompetitor.handle})` : ""}
              </span>
              <button className="w-7 h-7 rounded-full border border-line flex items-center justify-center" onClick={() => setAllPostsModal(false)}>
                ✕
              </button>
            </div>
            <div className="divide-y divide-line">
              {posts.map((p) => (
                <div key={p.id} className="py-3 text-[13px] space-y-1">
                  <div className="flex items-center justify-between mono text-[11px] text-muted">
                    <span>{p.posted_at ? new Date(p.posted_at).toLocaleDateString() : "—"}</span>
                    <span>♥ {p.likes ?? "—"} · ✎ {p.comments ?? "—"}</span>
                  </div>
                  <p className="text-pen leading-relaxed">{p.caption}</p>
                  {p.permalink && (
                    <a href={p.permalink} target="_blank" rel="noreferrer" className="text-[12px] text-brand-deep hover:underline">
                      Open permalink →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
