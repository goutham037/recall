import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { PageHeader, ProgressRing } from "../components/Shell";
import { CheckIcon, SparkleIcon } from "../lib/icons";

export default function Setup() {
  const [status, setStatus] = useState<any | null>(null);
  const [brand, setBrand] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const [s, b] = await Promise.all([api.status(), api.brand.get()]);
      setStatus(s);
      setBrand(b.brand);
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { refresh(); }, []);

  async function seed() {
    setBusy(true); setMsg(null); setErr(null);
    try {
      const r = await api.brand.seed();
      setMsg(`Seeded — Hindsight now holds ${r.seeded_memories ?? "?"} memories for ${r.brand}.`);
      refresh();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const integrations = [
    {
      name: "Hindsight",
      info: status?.hindsight,
      body: status?.hindsight?.stats
        ? `${status.hindsight.stats.total_nodes ?? 0} memories · ${status.hindsight.stats.total_links ?? 0} links`
        : status?.hindsight?.error || "waiting on a key",
      env: "HINDSIGHT_API_KEY · HINDSIGHT_BASE_URL",
      href: "https://ui.hindsight.vectorize.io",
      note: "The memory layer. Every fact and every past post is filed here.",
    },
    {
      name: "Groq",
      info: status?.groq,
      body: status?.groq?.sample ? `Ping: "${status.groq.sample}"` : status?.groq?.error || "waiting on a key",
      env: "GROQ_API_KEY · GROQ_MODEL",
      href: "https://console.groq.com/keys",
      note: "The LLM. Chooses tools, drafts plans, writes captions.",
    },
    {
      name: "Meta Graph",
      info: status?.meta,
      body:
        status?.meta?.ig_media_sample !== undefined
          ? `IG account reachable · media count ${status.meta.ig_media_sample}`
          : status?.meta?.error || "requires token + FB_PAGE_ID + IG_BUSINESS_ACCOUNT_ID",
      env: "META_ACCESS_TOKEN · FB_PAGE_ID · IG_BUSINESS_ACCOUNT_ID",
      href: "https://developers.facebook.com/tools/explorer/",
      note: "Publishing and competitor discovery.",
    },
  ];

  const configured = useMemo(
    () => integrations.filter((i) => i.info?.configured).length,
    [status]
  );
  const reachable = useMemo(
    () => integrations.filter((i) => i.info?.reachable).length,
    [status]
  );
  const progress = configured / integrations.length;

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title={<>Three integrations. <span className="serif-italic text-brand-deep">One brand.</span></>}
        kicker={<>Values live in <span className="kbd">backend/.env</span>. Restart the backend after edits, then seed the demo brand to load the NorthPulse dossier into Hindsight.</>}
        right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pr-3 border-r border-line">
              <ProgressRing value={progress} size={40} />
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted font-semibold">Wired</div>
                <div className="mono text-[13px] text-ink font-semibold">{configured}/3</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={seed} disabled={busy}>
              <SparkleIcon size={13} />
              {busy ? "Seeding…" : "Seed NorthPulse"}
            </button>
          </div>
        }
      />

      {msg && (
        <div className="card p-4 border-brand bg-brand-fill text-brand-deep text-sm reveal">
          <span className="mono flex items-center gap-2">
            <CheckIcon size={13} /> {msg}
          </span>
        </div>
      )}
      {err && (
        <div className="text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2 reveal">
          {err}
        </div>
      )}

      {/* Integrations */}
      <div className="section-divider">Integrations · 03 · {reachable} reachable</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 reveal-3">
        {integrations.map((it, i) => (
          <IntegrationCard key={it.name} idx={i + 1} {...it} />
        ))}
      </div>

      {/* Brand card */}
      {brand && (
        <>
          <div className="section-divider">The Brand on File</div>
          <div className="card p-8 reveal-4">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <div className="eyebrow eyebrow-brand"><span className="dot-lead" /> Active dossier</div>
                <div className="h1 mt-3" style={{ fontSize: "clamp(38px, 4vw, 52px)" }}>{brand.name}</div>
                <div className="mt-2 serif-italic text-[20px] text-muted">{brand.tagline}</div>
              </div>
              <span className="tag tag-brand mono">
                <span className="dot dot-green mr-1" /> Loaded
              </span>
            </div>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Field k="Voice" v={brand.voice} wide />
              <Field k="Audience" v={brand.audience} wide />
              <Field k="Website" v={brand.website} />
              <Field k="Instagram" v={brand.ig_username && "@" + brand.ig_username} />
              <div className="md:col-span-2">
                <div className="field-label">Pillars</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(brand.pillars_json || []).map((p: any) => (
                    <span key={p.name} className="tag">{p.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Demo script */}
      <div className="section-divider">The Demo · 60 seconds</div>
      <div className="card p-8 reveal-4">
        <ol className="editorial-list">
          <li>Hit <b>Seed NorthPulse</b> above.</li>
          <li>Open <b>Chat</b>: ask <span className="serif-italic">"What do you know about our brand?"</span> then <span className="serif-italic">"Plan me 7 days, focus Trail Hoodie drop, IG + FB."</span></li>
          <li>Head to <b>Calendar</b>. Every draft carries a <span className="serif-italic">"Why now"</span> citing a specific memory. Edit and Publish.</li>
          <li>Open <b>Competitors</b>, track a real IG business handle. Watch memories appear in Hindsight in real time.</li>
          <li>Return to <b>Chat</b>: <span className="serif-italic">"How is @rival different from us?"</span> — the agent reads from its notes.</li>
          <li>Open <b>Memory</b>, tap <b>Reflect</b> on <span className="serif-italic">"what makes our posts work?"</span> — the killer moment.</li>
        </ol>
      </div>
    </>
  );
}

function IntegrationCard({
  idx, name, info, body, env, href, note,
}: {
  idx: number; name: string; info: any; body: string; env: string; href?: string; note: string;
}) {
  const state = !info?.configured
    ? { dot: "dot-gray", label: "Not configured", tone: "tag" }
    : info?.reachable
      ? { dot: "dot-green", label: "Reachable", tone: "tag-brand" }
      : { dot: "dot-amber", label: "Configured", tone: "tag-warn" };
  return (
    <article className="card p-5 flex flex-col hover-lift">
      <div className="flex items-baseline justify-between">
        <div className="mono text-[10.5px] text-muted">
          №&nbsp;{String(idx).padStart(2, "0")}
        </div>
        <span className={"tag mono " + state.tone}>
          <span className={"dot " + state.dot + " mr-1"} /> {state.label}
        </span>
      </div>
      <h3 className="h2 !text-[26px] mt-3">{name}</h3>
      <p className="mt-2 text-[13px] text-muted leading-relaxed">{note}</p>
      <div className="mt-4 pt-4 border-t border-line text-[12.5px] flex-1">{body}</div>
      <div className="mt-3 mono text-[10.5px] text-soft">{env}</div>
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className="link-underline text-[12.5px] mt-2 inline-block">
          Get keys ↗
        </a>
      )}
    </article>
  );
}

function Field({ k, v, wide = false }: { k: string; v: any; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <div className="field-label">{k}</div>
      <div className="text-ink whitespace-pre-wrap leading-relaxed">
        {v || <span className="text-soft italic">—</span>}
      </div>
    </div>
  );
}
