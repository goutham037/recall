import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PageHeader, Sparkline } from "../components/Shell";
import { SparkleIcon, RefreshIcon, PlusIcon, ExternalIcon, BoltIcon, TrashIcon } from "../lib/icons";
import { UnderstatedTabs, EvidenceDrawer, TechnicalDetails, ShowMore } from "../components/DisclosurePrimitives";

export default function Studio() {
  const [activeTab, setActiveTab] = useState("create");
  const [signalDrawer, setSignalDrawer] = useState<{
    title: string;
    subtitle: string;
    badge: string;
    items: { label: string; detail: string; metric?: string }[];
    technical?: any;
  } | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="The Signal Desk"
        title={<>Generate. Analyze. <span className="serif-italic text-brand-deep">Recommend.</span></>}
        kicker="What the market is saying. What your competitors are doing. What your memory says about it."
      />

      {/* Signal Desk 3-Zone Synthesis Banner (Rule 17) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-white border-line flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-[10.5px] font-mono text-muted uppercase tracking-wider mb-1 font-bold">
              01 · COMPETITOR SIGNALS
            </div>
            <div className="serif text-[17px] text-ink font-medium leading-snug">
              Rivals are pushing discount-led messaging.
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted leading-relaxed">
              Tracked competitors rely on flash markdowns; our data shows audience values real kitchen solutions.
            </p>
          </div>
          <button
            onClick={() =>
              setSignalDrawer({
                title: "Competitor Market Signals",
                subtitle: "Observed messaging tactics from tracked rival feeds.",
                badge: "COMPETITOR INTELLIGENCE",
                items: [
                  { label: "@blinkit_in", detail: "Heavy push on 10-minute grocery delivery coupons & snacks.", metric: "24 posts" },
                  { label: "@zeptonow", detail: "Promotional hero banners with flat discounts and midnight offers.", metric: "18 posts" },
                  { label: "@swiggy_instamart", detail: "Meme-led weekend product carousels with lower bookmark rates.", metric: "31 posts" },
                ],
                technical: {
                  monitored_sources: 3,
                  refresh_cycle: "Automatic dispatch sync via Meta Graph",
                  hindsight_tag: "competitor:all",
                },
              })
            }
            className="mt-3 text-[12px] text-brand-deep font-semibold hover:underline text-left inline-flex items-center gap-1"
          >
            <span>View 7 signals</span>
            <span>→</span>
          </button>
        </div>

        <div className="card p-5 bg-white border-line flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-[10.5px] font-mono text-muted uppercase tracking-wider mb-1 font-bold">
              02 · MARKET PATTERNS
            </div>
            <div className="serif text-[17px] text-ink font-medium leading-snug">
              Late-evening content receives strongest response.
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted leading-relaxed">
              Highest save rate between 7:30 PM – 10:30 PM; conversational pantry voice drives 2.5x comments.
            </p>
          </div>
          <button
            onClick={() =>
              setSignalDrawer({
                title: "Observed Market Patterns",
                subtitle: "Audience activity and save-frequency correlation across weeks.",
                badge: "PATTERN SYNTHESIS",
                items: [
                  { label: "Prime Slot Window", detail: "Sunday evenings 6:00 – 9:30 PM IST yields peak engagement.", metric: "3.4x avg" },
                  { label: "Format Leverage", detail: "Reels solving instant dinner friction produce 7.1x more saves than static flyers.", metric: "7.1x saves" },
                  { label: "Tone Resonance", detail: "Group-chat informal tone beats promotional corporate copy.", metric: "+140% saves" },
                ],
                technical: {
                  analyzed_sessions: 42,
                  metric_decay: "Weighted exponential moving average",
                  confidence_score: 0.94,
                },
              })
            }
            className="mt-3 text-[12px] text-brand-deep font-semibold hover:underline text-left inline-flex items-center gap-1"
          >
            <span>View pattern</span>
            <span>→</span>
          </button>
        </div>

        <div className="card p-5 bg-brand-soft/40 border-brand/30 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-[10.5px] font-mono text-brand-deep font-bold uppercase tracking-wider mb-1">
              03 · YOUR MEMORY LAYER
            </div>
            <div className="serif text-[17px] text-ink font-medium leading-snug">
              34 durable memories connected.
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted leading-relaxed">
              Every past post outcome is indexed in Vectorize Hindsight for autonomous strategic grounding.
            </p>
          </div>
          <Link
            to="/app/memory"
            className="mt-3 text-[12px] text-brand-deep font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Open Memory Vault</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Tabs Switcher: CREATE | STRATEGY | ANALYZE (Rule 67) */}
      <UnderstatedTabs
        tabs={[
          { id: "create", label: "Create Variants" },
          { id: "strategy", label: "Strategy & 5 Actions" },
          { id: "analyze", label: "Analytics & Research" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: CREATE */}
      {activeTab === "create" && <Generator />}

      {/* TAB 2: STRATEGY */}
      {activeTab === "strategy" && <Recommendations />}

      {/* TAB 3: ANALYZE */}
      {activeTab === "analyze" && (
        <div className="space-y-8">
          <Analytics />
          <Trending />
        </div>
      )}

      {/* Signal Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(signalDrawer)}
        onClose={() => setSignalDrawer(null)}
        title={signalDrawer?.title || "Signal Details"}
        subtitle={signalDrawer?.subtitle}
        badge={signalDrawer?.badge}
      >
        {signalDrawer && (
          <div className="space-y-6">
            <div className="space-y-3">
              {signalDrawer.items.map((it, idx) => (
                <div key={idx} className="p-4 bg-surface border border-line rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="serif text-[15px] font-semibold text-ink">{it.label}</span>
                    {it.metric && (
                      <span className="mono text-[11px] font-semibold text-brand-deep bg-brand-soft px-2 py-0.5 rounded">
                        {it.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-pen leading-relaxed">{it.detail}</p>
                </div>
              ))}
            </div>

            {signalDrawer.technical && (
              <TechnicalDetails
                label="Signal Ingestion Telemetry"
                data={signalDrawer.technical}
              />
            )}
          </div>
        )}
      </EvidenceDrawer>
    </>
  );
}

/* ─── GENERATOR ─────────────────────────────────────────────── */
function Generator() {
  const [topic, setTopic] = useState(() => sessionStorage.getItem("recall_studio_topic") || "");
  const [tone, setTone] = useState(() => sessionStorage.getItem("recall_studio_tone") || "");
  const [cta, setCta] = useState(() => sessionStorage.getItem("recall_studio_cta") || "");
  const [channels, setChannels] = useState<string[]>(() => {
    try {
      const s = sessionStorage.getItem("recall_studio_channels");
      return s ? JSON.parse(s) : ["instagram", "facebook"];
    } catch { return ["instagram", "facebook"]; }
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [variants, setVariants] = useState<any[]>(() => {
    try {
      const s = sessionStorage.getItem("recall_studio_variants");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [grounded, setGrounded] = useState<number>(() => {
    const s = sessionStorage.getItem("recall_studio_grounded");
    return s ? Number(s) : 0;
  });
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    try {
      const s = sessionStorage.getItem("recall_studio_savedIds");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [brand, setBrand] = useState<any>(null);
  const [activeReasoning, setActiveReasoning] = useState<any | null>(null);

  useEffect(() => {
    api.brand.get().then((r) => { if (r?.brand) setBrand(r.brand); }).catch(() => {});
  }, []);

  useEffect(() => {
    sessionStorage.setItem("recall_studio_topic", topic);
    sessionStorage.setItem("recall_studio_tone", tone);
    sessionStorage.setItem("recall_studio_cta", cta);
    sessionStorage.setItem("recall_studio_channels", JSON.stringify(channels));
    sessionStorage.setItem("recall_studio_variants", JSON.stringify(variants));
    sessionStorage.setItem("recall_studio_grounded", String(grounded));
    sessionStorage.setItem("recall_studio_savedIds", JSON.stringify(savedIds));
  }, [topic, tone, cta, channels, variants, grounded, savedIds]);

  const [savingIdx, setSavingIdx] = useState<number | null>(null);

  function clearVariants() {
    setVariants([]);
    setSavedIds([]);
    setGrounded(0);
    sessionStorage.removeItem("recall_studio_variants");
    sessionStorage.removeItem("recall_studio_savedIds");
    sessionStorage.removeItem("recall_studio_grounded");
  }

  function removeVariant(index: number) {
    setVariants((prev) => {
      const next = prev.filter((_, i) => i !== index);
      sessionStorage.setItem("recall_studio_variants", JSON.stringify(next));
      return next;
    });
  }

  async function saveSingleVariant(v: any, index: number) {
    setSavingIdx(index);
    try {
      const res = await api.content.createItem({
        hook: v.hook,
        caption: v.caption,
        hashtags: v.hashtags,
        image_prompt: v.image_prompt,
        cta_link: v.cta_link || cta || brand?.website,
        rationale: v.rationale,
        image_url: v.image_url,
        channels,
        status: "draft",
      });
      if (res?.item?.id) {
        setSavedIds((prev) => [...prev, res.item.id]);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSavingIdx(null);
    }
  }

  async function run(saveAsDrafts: boolean) {
    if (!topic.trim()) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.studio.generate({
        topic,
        tone: tone || undefined,
        cta_link: cta || undefined,
        channels,
        save_as_draft: saveAsDrafts,
        save_as_drafts: saveAsDrafts,
      });
      setVariants(r.variants || []);
      setGrounded(r.grounded_on_memories || 0);
      const ids = r.saved_ids || (r.drafted || []).map((d: any) => d.id) || [];
      if (ids.length > 0) setSavedIds(ids);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

function StudioGeneratingStages({ topic }: { topic: string }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const intervals = [
      setTimeout(() => setStage(1), 1500),
      setTimeout(() => setStage(2), 3200),
      setTimeout(() => setStage(3), 5000),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  const stages = [
    { title: "Querying Vectorize Hindsight", detail: "Scanning past performance memories and brand DNA..." },
    { title: "Synthesizing Market Intelligence", detail: "Correlating competitor patterns and audience resonance..." },
    { title: "Composing 3 Memory-Grounded Variants", detail: `Formulating hook, caption, and art direction for "${topic}"...` },
    { title: "Final Strategic Alignment", detail: "Assigning memory citations and packaging creative variants..." },
  ];

  const current = stages[Math.min(stage, stages.length - 1)];

  return (
    <div className="space-y-2">
      <div className="mono text-[12.5px] font-semibold text-brand-deep">
        {current.title}
      </div>
      <p className="text-[13px] text-muted leading-relaxed font-sans max-w-sm mx-auto">
        {current.detail}
      </p>
      <div className="w-48 h-1.5 bg-line rounded-full mx-auto overflow-hidden mt-2.5">
        <div
          className="h-full bg-brand transition-all duration-700 ease-out"
          style={{ width: `${((stage + 1) / stages.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ...
  return (
    <div className="space-y-6">
      <div className="card p-6 bg-white shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-5">
          <div className="eyebrow eyebrow-brand">
            <SparkleIcon size={13} /> Post Generator
          </div>
          <div className="flex items-center gap-3">
            {variants.length > 0 && (
              <button
                type="button"
                onClick={clearVariants}
                className="text-[11.5px] text-muted hover:text-red-700 flex items-center gap-1 transition"
                title="Discard currently generated variants and start fresh"
              >
                <TrashIcon size={12} /> Clear variants
              </button>
            )}
            <span className="mono text-[11px] text-muted">
              Grounded in Hindsight memory
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="field-label">Topic or product focus</label>
            <input
              className="input"
              placeholder="e.g. 15-minute emergency dinner solve with organic garlic butter sauce"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Tone (optional)</label>
            <input
              className="input"
              placeholder="e.g. conversational, candid, high utility"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Publishing Channels</label>
            <div className="flex gap-2">
              {(["instagram", "facebook"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setChannels((s) =>
                      s.includes(c) ? s.filter((x) => x !== c) : [...s, c]
                    )
                  }
                  className={"btn btn-sm capitalize " + (channels.includes(c) ? "btn-ink" : "btn-ghost border border-line")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="field-label">CTA link (optional)</label>
            <input
              className="input mono text-[13px]"
              placeholder={brand?.website || "https://sunshainy-mart.vercel.app/"}
              value={cta}
              onChange={(e) => setCta(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2 flex-wrap gap-2">
            <div>
              {variants.length > 0 && (
                <button
                  type="button"
                  onClick={clearVariants}
                  className="btn btn-sm btn-ghost text-muted hover:text-red-700 flex items-center gap-1.5"
                >
                  <TrashIcon size={12} /> Clear previous variants
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost border border-line text-[13px]" onClick={() => run(false)} disabled={busy || !topic}>
                <SparkleIcon size={13} /> {busy ? "Composing…" : "Generate 3 variants"}
              </button>
              <button className="btn btn-primary text-[13px]" onClick={() => run(true)} disabled={busy || !topic}>
                <PlusIcon size={13} /> Generate + save as drafts
              </button>
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-4 text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        {savedIds.length > 0 && (
          <div className="mt-4 p-3.5 bg-brand-soft border border-brand/30 rounded-lg flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-ink font-medium">
                Saved {savedIds.length} draft{savedIds.length > 1 ? "s" : ""} to your Editorial Calendar
              </span>
            </div>
            <Link to="/app/calendar?tab=drafts" className="btn btn-sm btn-primary">
              View in Calendar &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Shimmering Variant Placeholder Tiles while Generating */}
      {busy && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-surface border border-line rounded-lg">
            <div className="text-[12.5px] text-brand-deep mono font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              Synthesizing 3 memory-grounded creative variants for "{topic || 'your brief'}"…
            </div>
            <span className="text-[11px] mono text-muted">Reading Vectorize Hindsight</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="shimmer-slot-tile p-5 bg-white shadow-xs space-y-3.5 border-line">
                <div className="w-full h-44 rounded-lg bg-quiet/80 flex items-center justify-center">
                  <span className="mono text-[10px] text-muted/60">synthesizing creative visual…</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <span className="mono text-[11px] text-brand-deep font-bold">
                    {idx === 0 ? "Variant A · Highest-leverage" : idx === 1 ? "Variant B · New angle" : "Variant C · Short & punchy"}
                  </span>
                  <span className="mono text-[10.5px] text-muted">№ 0{idx + 1}</span>
                </div>
                <div className="h-4 w-4/5 bg-brand/15 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-line/60 rounded" />
                  <div className="h-3 w-5/6 bg-line/60 rounded" />
                  <div className="h-3 w-2/3 bg-line/40 rounded" />
                </div>
                <div className="pt-3 border-t border-line text-[11px] mono text-brand-deep flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <span>Grounding in Vectorize Hindsight…</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {variants.length > 0 && !busy && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-surface border border-line rounded-lg">
            <div className="text-[12px] text-muted mono">
              Grounded on <strong className="text-ink">{grounded}</strong> memories · <strong className="text-ink">{variants.length}</strong> creative variant{variants.length > 1 ? "s" : ""}
            </div>
            <button
              type="button"
              onClick={clearVariants}
              className="btn btn-sm btn-ghost text-muted hover:text-red-700 flex items-center gap-1.5 text-xs"
            >
              <TrashIcon size={12} /> Clear all variants
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {variants.map((v, i) => (
              <VariantCard
                key={i}
                idx={i}
                v={v}
                onOpenReasoning={(data) => setActiveReasoning(data)}
                onRemove={() => removeVariant(i)}
                onSaveAsDraft={() => saveSingleVariant(v, i)}
                isSaved={savedIds.length > 0}
                isSaving={savingIdx === i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Variant Reasoning Drawer (Rule 19) */}
      <EvidenceDrawer
        isOpen={Boolean(activeReasoning)}
        onClose={() => setActiveReasoning(null)}
        title={activeReasoning?.hook || "Why This Variant?"}
        subtitle="Strategic memory basis and creative art direction."
        badge="VARIANT REASONING"
      >
        {activeReasoning && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-1 font-semibold">
                Strategic Rationale
              </div>
              <p className="text-[13.5px] text-ink leading-relaxed font-sans">
                {activeReasoning.rationale || "Uses a high-performing format from recent campaigns to capture weeknight saves."}
              </p>
            </div>

            {activeReasoning.memory_ref && (
              <div className="p-4 bg-brand-soft border border-brand/30 rounded-lg space-y-1">
                <div className="text-[10.5px] uppercase font-mono tracking-wider text-brand-deep font-bold">
                  Memory Grounding Cited
                </div>
                <div className="serif text-[15px] text-ink font-medium">
                  "{activeReasoning.memory_ref}"
                </div>
              </div>
            )}

            {activeReasoning.image_prompt && (
              <div>
                <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-1 font-semibold">
                  Art Direction & Visual Brief
                </div>
                <div className="p-3.5 bg-surface-subtle border border-line rounded text-[12.5px] text-pen leading-relaxed">
                  {activeReasoning.image_prompt}
                </div>
              </div>
            )}

            <TechnicalDetails
              label="Creative Generation Parameters"
              data={{
                variant_index: activeReasoning.idx,
                channel: "instagram + facebook",
                memory_source: "Vectorize Hindsight bank 'sunshainy-mart'",
                generation_model: "llama-3.3-70b-versatile",
              }}
            />
          </div>
        )}
      </EvidenceDrawer>
    </div>
  );
}

function VariantCard({
  idx,
  v,
  onOpenReasoning,
  onRemove,
  onSaveAsDraft,
  isSaved,
  isSaving,
}: {
  idx: number;
  v: any;
  onOpenReasoning: (data: any) => void;
  onRemove?: () => void;
  onSaveAsDraft?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
}) {
  const labels = ["A · Highest-leverage", "B · New angle", "C · Short & punchy"];
  return (
    <article className="card p-5 flex flex-col justify-between bg-white shadow-xs">
      <div>
        {v.image_url && (
          <div className="relative mb-3.5 rounded-lg overflow-hidden h-44 bg-quiet border border-line">
            <img src={v.image_url} alt={v.hook || "Graphic preview"} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-ink/80 text-canvas text-[10px] mono">
              demo graphic
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pb-2 border-b border-line">
          <span className="mono text-[11px] text-brand-deep font-bold">{labels[idx] || `Variant ${idx + 1}`}</span>
          <div className="flex items-center gap-2">
            <span className="mono text-[10.5px] text-muted">
              №&nbsp;{String(idx + 1).padStart(2, "0")}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title="Remove this variant"
                className="w-5 h-5 rounded hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center transition-colors"
              >
                <TrashIcon size={12} />
              </button>
            )}
          </div>
        </div>

        <h4 className="serif text-[18px] text-ink font-medium mt-3 leading-snug">{v.hook}</h4>
        <div className="mt-2 text-[13px] leading-relaxed text-pen">
          <ShowMore text={v.caption} maxLength={120} />
        </div>

        {v.cta_link && (
          <a
            href={v.cta_link}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-brand-deep hover:underline truncate block mt-2"
          >
            {v.cta_link}
          </a>
        )}

        {/* 1-Line Memory Basis (Rule 19) */}
        <div className="mt-3.5 pt-3 border-t border-line text-[12px] text-muted">
          <span className="font-semibold text-ink">Memory basis: </span>
          <span>{v.memory_ref ? `"${v.memory_ref.slice(0, 75)}…"` : "Derived from top-performing kitchen solve pattern."}</span>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-line flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => onOpenReasoning({ ...v, idx })}
          className="text-[12px] text-brand-deep font-semibold hover:underline"
        >
          View reasoning →
        </button>
        {onSaveAsDraft && (
          <button
            type="button"
            onClick={onSaveAsDraft}
            disabled={isSaved || isSaving}
            className={`btn btn-xs ${isSaved ? "btn-ghost text-brand-deep border border-brand/40 bg-brand-soft/40 cursor-default" : "btn-ghost border border-line hover:border-brand text-ink hover:text-brand-deep"}`}
          >
            {isSaving ? "Saving…" : isSaved ? "✓ In Calendar" : "+ Save as Draft"}
          </button>
        )}
      </div>
    </article>
  );
}

/* ─── RECOMMENDATIONS (Five Actions · Rule 20) ───────────────── */
function Recommendations() {
  const [actions, setActions] = useState<any[]>([]);
  const [grounded, setGrounded] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);

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

  return (
    <div className="card p-6 bg-white shadow-xs">
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-line">
        <div>
          <div className="eyebrow eyebrow-brand"><BoltIcon size={13} /> Five actions</div>
          <div className="serif text-[22px] font-normal text-ink mt-1">Ordered by leverage. Grounded in memory.</div>
          <div className="mono text-[11px] text-muted mt-1">
            Grounded on {grounded} memories
          </div>
        </div>
        <button className="btn btn-sm btn-ghost border border-line" onClick={run} disabled={busy}>
          <RefreshIcon size={13} /> {busy ? "…" : "Regenerate"}
        </button>
      </div>

      {err && (
        <div className="text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2 mb-4">
          {err}
        </div>
      )}

      {actions.length === 0 && !busy && !err && (
        <div className="text-muted text-sm italic py-6 text-center">
          Nothing to recommend yet. Seed the demo brand or add memories.
        </div>
      )}

      {/* Compact Action List (Rule 20) */}
      <div className="divide-y divide-line">
        {actions.map((a, i) => (
          <div key={i} className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="mono text-[12px] font-bold text-brand-deep w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="serif text-[17px] text-ink font-medium leading-tight">
                  {a.title}
                </div>
                <div className="text-[12.5px] text-muted mt-0.5">
                  {a.urgency === "now" ? "Immediate · Today" : a.urgency === "this-week" ? "This week" : "Next cycle"} — {a.why ? a.why.slice(0, 90) + "…" : "High audience recall potential."}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAction(a)}
              className="text-[12px] text-brand-deep font-semibold hover:underline whitespace-nowrap"
            >
              View strategy →
            </button>
          </div>
        ))}
      </div>

      {/* Strategy Detail Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(selectedAction)}
        onClose={() => setSelectedAction(null)}
        title={selectedAction?.title || "Action Strategy"}
        subtitle="Complete strategic rationale and memory grounding."
        badge="ACTION STRATEGY"
      >
        {selectedAction && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-1 font-semibold">
                Strategic Rationale
              </div>
              <p className="text-[14px] text-ink leading-relaxed">
                {selectedAction.why}
              </p>
            </div>

            {selectedAction.memory_ref && (
              <div className="p-4 bg-brand-soft border border-brand/30 rounded-lg space-y-1">
                <div className="text-[10.5px] uppercase font-mono tracking-wider text-brand-deep font-bold">
                  Memory Cited
                </div>
                <div className="serif text-[15px] text-ink font-medium">
                  "{selectedAction.memory_ref}"
                </div>
              </div>
            )}

            <TechnicalDetails
              label="Leverage Calculation"
              data={{
                urgency: selectedAction.urgency,
                estimated_reach_lift: "2.4x",
                suggested_channel: "Instagram Reel",
              }}
            />
          </div>
        )}
      </EvidenceDrawer>
    </div>
  );
}

/* ─── ANALYTICS (Rule 74) ───────────────────────────────────── */
function Analytics() {
  const [d, setD] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editorialExpanded, setEditorialExpanded] = useState(false);

  async function run() {
    setBusy(true); setErr(null);
    try { setD(await api.studio.analytics()); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { run(); }, []);

  const m = d?.metrics || {};
  const perPillar: Record<string, number> = d?.per_pillar || {};
  const maxPillar = Math.max(1, ...Object.values(perPillar).map(Number));
  const chanEntries: [string, number][] = Object.entries(d?.by_channel || {});
  const chanTotal = chanEntries.reduce((n, [, v]) => n + Number(v || 0), 0);

  const fakeSpark = (seed: number) => {
    const base = [10, 14, 18, 15, 22, 28, 32];
    return base.map((v, i) => Math.max(2, v + Math.sin(i + seed) * 6));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Posts" value={d?.counts?.posts ?? "—"} spark={fakeSpark(0)} highlight />
        <MetricCard label="Reach" value={fmt(m.reach)} spark={fakeSpark(1)} />
        <MetricCard label="Saved" value={fmt(m.saved)} spark={fakeSpark(2)} />
        <MetricCard label="Engagement" value={fmt(m.engagement)} spark={fakeSpark(3)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="card p-6 bg-white shadow-xs">
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

        <div className="card p-6 bg-white shadow-xs">
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

      {/* Editorial Analysis - Collapsible per Rule 74 */}
      {d?.narrative?.text && (
        <div className="card-solid p-6 rounded-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span className="dot-lead" /> The Editorial
            </div>
            <button
              onClick={() => setEditorialExpanded(!editorialExpanded)}
              className="text-[12px] mono text-canvas font-semibold hover:underline"
            >
              {editorialExpanded ? "Collapse analysis ↑" : "Read full analysis →"}
            </button>
          </div>
          <div className="serif-italic text-[22px] text-canvas mt-3">
            What the numbers actually say.
          </div>
          <p className="mt-2 text-[14px] text-canvas/80 leading-relaxed">
            {editorialExpanded
              ? d.narrative.text
              : d.narrative.text.slice(0, 180) + "…"}
          </p>
          {editorialExpanded && (d.narrative.based_on || []).length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
              <div className="mono text-[10.5px] uppercase tracking-wider text-canvas/50">Citations</div>
              {d.narrative.based_on.map((b: any, i: number) => (
                <div key={i} className="text-[12px] text-canvas/70 border-l-2 border-brand pl-3">
                  ({b.type}) {b.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {err && (
        <div className="text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
          {err}
        </div>
      )}
    </div>
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
      <div className="card p-6 bg-white shadow-xs">
        <div className="eyebrow mb-4"><span className="dot-lead" /> Top competitor posts · by engagement</div>
        <div className="divide-y divide-line">
          {(d?.top_posts || []).slice(0, 4).map((p: any) => (
            <div key={p.id} className="py-3">
              <div className="text-[11px] mono text-muted">
                {p.posted_at ? new Date(p.posted_at).toLocaleDateString() : "—"}{" "}
                · @{p.handle || "?"}{" "}
                <span className="text-soft">
                  · ♥ {p.likes ?? "—"} · ✎ {p.comments ?? "—"}
                </span>
              </div>
              <div className="text-[13px] mt-1 line-clamp-2 text-pen">{p.caption}</div>
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

      <div className="card p-6 bg-white shadow-xs">
        <div className="eyebrow mb-4"><span className="dot-lead" /> Hashtag frequency</div>
        <div className="space-y-2.5">
          {(d?.top_hashtags || []).slice(0, 6).map((h: any) => (
            <div key={h.tag}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="mono text-brand-deep font-semibold">{h.tag}</span>
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
      </div>
      {err && (
        <div className="col-span-full text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
          {err}
        </div>
      )}
    </div>
  );
}
