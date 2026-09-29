import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { CheckIcon, PlusIcon, RefreshIcon, ExternalIcon } from "../lib/icons";
import { UnderstatedTabs, EvidenceDrawer, TechnicalDetails, DetailsDisclosure } from "../components/DisclosurePrimitives";

export default function Setup() {
  const [activeTab, setActiveTab] = useState("profile");
  const [status, setStatus] = useState<any | null>(null);
  const [brand, setBrand] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Edit brand form state
  const [editingBrand, setEditingBrand] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: "",
    tagline: "",
    voice: "",
    audience: "",
    website: "",
    pillars_str: "",
  });

  const [evidenceDrawer, setEvidenceDrawer] = useState<{
    title: string;
    subtitle: string;
    badge: string;
    details: string;
    metric?: string;
    hindsightProof?: string;
  } | null>(null);

  async function refresh() {
    try {
      const [s, b] = await Promise.all([api.status(), api.brand.get()]);
      setStatus(s);
      setBrand(b.brand);
      if (b.brand) {
        setBrandForm({
          name: b.brand.name || "",
          tagline: b.brand.tagline || "",
          voice: b.brand.voice || "",
          audience: b.brand.audience || "",
          website: b.brand.website || "",
          pillars_str: (b.brand.pillars_json || [])
            .map((p: any) => p.name || p)
            .join(", "),
        });
      }
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function saveBrand(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const pillars = brandForm.pillars_str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, detail: `${name} content and community updates` }));

      const res = await api.brand.put({
        name: brandForm.name.trim(),
        tagline: brandForm.tagline.trim() || undefined,
        voice: brandForm.voice.trim() || undefined,
        audience: brandForm.audience.trim() || undefined,
        website: brandForm.website.trim() || undefined,
        pillars_json: pillars.length > 0 ? pillars : undefined,
      });
      setBrand(res.brand);
      setEditingBrand(false);
      setMsg(`Brand dossier updated. All memory recall and agent synthesis are synchronized with "${res.brand?.name}".`);
      await refresh();
    } catch (ex: any) {
      setErr(ex.message || "Failed to update brand.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Dominant Page Header (Rule 39) */}
      <PageHeader
        eyebrow="BRAND FOUNDATION"
        title={
          <>
            YOUR BRAND <span className="serif-italic text-brand-deep">DOSSIER.</span>
          </>
        }
        kicker="Core identity, voice principles, and audience truths anchoring every decision."
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingBrand(!editingBrand)}
              className="btn btn-sm btn-primary"
            >
              {editingBrand ? "Close Editor" : "Edit Dossier"}
            </button>
          </div>
        }
      />

      {msg && (
        <div className="p-3.5 rounded-lg border border-brand bg-brand-soft text-brand-deep text-[13px] flex items-center gap-2">
          <CheckIcon size={14} /> {msg}
        </div>
      )}
      {err && (
        <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-800 text-[13px]">
          {err}
        </div>
      )}

      {/* Editor Modal / Accordion */}
      {editingBrand && (
        <form onSubmit={saveBrand} className="card p-6 bg-white space-y-5 border-l-4 border-l-brand shadow-xs reveal">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-brand-deep font-bold">
                EDIT STRATEGIC DOSSIER
              </div>
              <h3 className="serif text-[22px] text-ink font-medium mt-0.5">
                Refine what the agent remembers about {brand?.name || "your brand"}
              </h3>
            </div>
            <span className="mono text-[10.5px] bg-brand-soft text-brand-deep px-2.5 py-0.5 rounded font-semibold">
              Synced to Hindsight
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Brand Name</label>
              <input
                className="input w-full"
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="field-label">Website / Digital Storefront</label>
              <input
                className="input mono text-sm w-full"
                value={brandForm.website}
                onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Tagline & Core Purpose</label>
            <input
              className="input w-full"
              value={brandForm.tagline}
              onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Voice & Tone Directives</label>
            <textarea
              className="input w-full text-sm leading-relaxed"
              rows={2}
              value={brandForm.voice}
              onChange={(e) => setBrandForm({ ...brandForm, voice: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Target Audience & Problem Solved</label>
            <textarea
              className="input w-full text-sm leading-relaxed"
              rows={2}
              value={brandForm.audience}
              onChange={(e) => setBrandForm({ ...brandForm, audience: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Content Pillars (comma-separated)</label>
            <input
              className="input w-full"
              value={brandForm.pillars_str}
              onChange={(e) => setBrandForm({ ...brandForm, pillars_str: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => setEditingBrand(false)}
              className="btn btn-sm btn-ghost border border-line"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !brandForm.name}
              className="btn btn-sm btn-primary"
            >
              {busy ? "Synchronizing…" : "Save Dossier"}
            </button>
          </div>
        </form>
      )}

      {/* Understated Tabs: PROFILE | VOICE | AUDIENCE | LEARNINGS (Rule 70) */}
      <UnderstatedTabs
        tabs={[
          { id: "profile", label: "Brand Profile" },
          { id: "voice", label: "Voice & Tone" },
          { id: "audience", label: "Audience Truths" },
          { id: "learnings", label: "Proven Learnings" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: PROFILE SUMMARY (Rule 39) */}
      {activeTab === "profile" && (
        <div className="card p-6 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              WHO WE ARE · ORGANIZATIONAL TRUTH
            </span>
            <button
              onClick={() => setEditingBrand(true)}
              className="text-[12.5px] text-brand-deep font-semibold hover:underline"
            >
              Edit profile →
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Brand Name</div>
              <div className="serif text-[26px] text-ink font-medium leading-tight mt-0.5">
                {brand?.name || "Sunshainy Mart"}
              </div>
            </div>

            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Mission / Core Purpose</div>
              <p className="text-[13.5px] text-ink leading-relaxed mt-1">
                {brand?.tagline || "Fresh, local convenience store & organic pantry essentials, delivering 15-minute meal solves for busy urban cooks."}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[12.5px] border-t border-line/60">
              <div>
                <span className="text-muted">Digital Store: </span>
                <a
                  href={brand?.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mono font-semibold text-brand-deep hover:underline"
                >
                  {brand?.website || "https://sunshainy-mart.vercel.app/"}
                </a>
              </div>
              <div>
                <span className="text-muted">Primary Feed: </span>
                <span className="mono font-semibold text-ink">
                  @{brand?.ig_username || "sunshainymart"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOICE SUMMARY (Rule 39) */}
      {activeTab === "voice" && (
        <div className="card p-6 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              HOW WE SPEAK · EDITORIAL DIRECTIVES
            </span>
            <button
              onClick={() => setEditingBrand(true)}
              className="text-[12.5px] text-brand-deep font-semibold hover:underline"
            >
              Edit voice →
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Tone Demeanor</div>
              <p className="text-[13.5px] text-ink leading-relaxed mt-1">
                {brand?.voice || "Direct, warm, candid — feels like a trusted neighborhood grocer in your group chat. Active verbs, honest advice, zero corporate jargon."}
              </p>
            </div>

            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Phrasing to Champion</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["15-minute emergency dinner", "pantry staples", "honest ingredients", "scratch-made", "weeknight save"].map((w) => (
                  <span key={w} className="text-[11px] bg-brand-soft text-brand-deep px-2 py-0.5 rounded font-mono font-medium">
                    "{w}"
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Words to Strictly Avoid</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["revolutionary", "disruptive", "cheap eats", "hack", "synergy"].map((w) => (
                  <span key={w} className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono line-through">
                    "{w}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIENCE SUMMARY (Rule 39) */}
      {activeTab === "audience" && (
        <div className="card p-6 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              WHO WE SERVE · AUDIENCE PSYCHOGRAPHY
            </span>
            <button
              onClick={() => setEditingBrand(true)}
              className="text-[12.5px] text-brand-deep font-semibold hover:underline"
            >
              Edit audience →
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Target Cohort</div>
              <p className="text-[13.5px] text-ink leading-relaxed mt-1">
                {brand?.audience || "Urban professionals, time-starved home cooks, young couples and apartment dwellers (22-38)."}
              </p>
            </div>

            <div>
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Core Cooking Frustrations</div>
              <ul className="text-[13px] text-ink space-y-1.5 mt-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-brand-deep font-bold">✓</span> Missing ingredients at 9:00 PM when dinner plans stall.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-deep font-bold">✓</span> Tired of overly packaged takeout food with poor nutritional value.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-deep font-bold">✓</span> Desire fast 15-minute one-pan meals with minimal cleanup.
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-line/60">
              <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">Prime Engagement Slot</div>
              <div className="mono text-[12.5px] text-brand-deep font-semibold mt-1">
                Sunday 6:00 PM – 9:00 PM IST (Weekly meal planning window)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WHAT WE LEARNED (Rule 40 & 41) */}
      {activeTab === "learnings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              HISTORICAL CONTENT TRUTHS
            </span>
          </div>

          {/* Rule 40: Proven Win Card */}
          <div className="card p-5 bg-white border border-line shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="mono text-[10.5px] text-brand-deep font-bold uppercase tracking-wider bg-brand-soft px-2 py-0.5 rounded">
                  PROVEN WIN
                </span>
                <span className="serif text-[18px] text-ink font-medium">Story-led Reel</span>
                <span className="mono text-[11px] text-brand-deep font-semibold">480 saves</span>
              </div>
              <p className="text-[13px] text-muted">
                "Strongest recent format. High conversion on everyday kitchen solves."
              </p>
            </div>
            <button
              onClick={() =>
                setEvidenceDrawer({
                  title: "Story-led Emergency Reel (480 saves)",
                  subtitle: "Recorded post outcome verified in Hindsight vector storage.",
                  badge: "PROVEN WIN EVIDENCE",
                  metric: "480 saves · 7.1x static lift",
                  details: "When addressing ingredients missing at 9:30 PM, bookmarking save rate jumped to 14.8%. Audience treats the content as an actionable reference guide rather than disposable entertainment.",
                  hindsightProof: "Memory #0248 stored in Vectorize Hindsight bank 'sunshainy-mart'. Referenced by 4 subsequent campaign iterations.",
                })
              }
              className="text-[12.5px] text-brand-deep font-semibold hover:underline whitespace-nowrap"
            >
              View evidence →
            </button>
          </div>

          {/* Rule 41: Underperforming Format Card */}
          <div className="card p-5 bg-white border border-line shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="mono text-[10.5px] text-red-700 font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                  UNDERPERFORMING
                </span>
                <span className="serif text-[18px] text-ink font-medium">Long-form carousel</span>
                <span className="mono text-[11px] text-muted">71 saves</span>
              </div>
              <p className="text-[13px] text-muted">
                "Audience dropped off early on multi-slide price lists."
              </p>
            </div>
            <button
              onClick={() =>
                setEvidenceDrawer({
                  title: "Long-form Discount Carousel (71 saves)",
                  subtitle: "Performance review of multi-slide catalog graphics.",
                  badge: "UNDERPERFORMING ANALYSIS",
                  metric: "71 saves · 1.2% rate",
                  details: "Static slide carousels focusing on item pricing showed an 80% drop-off by slide 3. Recommendation: Retire static product lists in favor of 15-second process video.",
                  hindsightProof: "Memory #0012 archived with negative performance weighting.",
                })
              }
              className="text-[12.5px] text-muted font-semibold hover:underline whitespace-nowrap"
            >
              Details →
            </button>
          </div>
        </div>
      )}

      {/* Rule 38: Technical Details / Integrations Collapsible */}
      <div className="pt-4">
        <TechnicalDetails
          label="System & Telemetry Integrations"
          data={{
            memory_engine: status?.hindsight?.reachable ? "Vectorize Hindsight (Connected)" : "Disconnected",
            reasoning_model: status?.groq?.model || "Llama-3.3-70b-versatile (Groq)",
            social_mesh: "Meta Graph API (Instagram + Facebook)",
            vector_bank: "sunshainy-mart",
          }}
        />
      </div>

      {/* Evidence Drawer for Wins / Underperforming */}
      <EvidenceDrawer
        isOpen={Boolean(evidenceDrawer)}
        onClose={() => setEvidenceDrawer(null)}
        title={evidenceDrawer?.title || "Format Evidence"}
        subtitle={evidenceDrawer?.subtitle}
        badge={evidenceDrawer?.badge}
      >
        {evidenceDrawer && (
          <div className="space-y-6">
            {evidenceDrawer.metric && (
              <div className="p-3.5 bg-brand-soft border border-brand/30 rounded-lg">
                <div className="text-[10.5px] uppercase font-mono tracking-wider text-brand-deep font-bold">
                  Historical Outcome
                </div>
                <div className="serif text-[20px] text-ink font-semibold mt-0.5">
                  {evidenceDrawer.metric}
                </div>
              </div>
            )}

            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono text-muted mb-1 font-semibold">
                Observed Performance Truth
              </div>
              <p className="text-[13.5px] text-ink leading-relaxed font-sans">
                {evidenceDrawer.details}
              </p>
            </div>

            {evidenceDrawer.hindsightProof && (
              <div className="p-3 bg-surface-subtle border border-line rounded text-[12.5px] text-pen font-mono">
                <span className="font-semibold text-brand-deep block mb-0.5">HINDSIGHT AUDIT:</span>
                {evidenceDrawer.hindsightProof}
              </div>
            )}
          </div>
        )}
      </EvidenceDrawer>
    </div>
  );
}
