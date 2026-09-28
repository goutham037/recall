import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHead } from "../components/Shell";
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
    } catch (e: any) {
      setErr(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function seed() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const r = await api.brand.seed();
      setMsg(
        `Seeded — Hindsight now holds ${r.seeded_memories ?? "?"} memories for ${r.brand}.`
      );
      refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
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
      body: status?.groq?.sample
        ? `Ping: "${status.groq.sample}"`
        : status?.groq?.error || "waiting on a key",
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
          : status?.meta?.error ||
            "requires token + FB_PAGE_ID + IG_BUSINESS_ACCOUNT_ID",
      env: "META_ACCESS_TOKEN · FB_PAGE_ID · IG_BUSINESS_ACCOUNT_ID",
      href: "https://developers.facebook.com/tools/explorer/",
      note: "Publishing and competitor discovery.",
    },
  ];

  return (
    <>
      <PageHead
        eyebrow="Section 05 · The Set-up"
        title={
          <>
            Three integrations.{" "}
            <span className="serif-italic text-brand-deep">One brand.</span>
            <br />
            Then chat.
          </>
        }
        kicker={
          <>
            Values live in <span className="kbd">backend/.env</span>. Restart
            the backend after edits, then seed the demo brand to load the
            NorthPulse dossier into Hindsight.
          </>
        }
        right={
          <button
            className="btn btn-primary"
            onClick={seed}
            disabled={busy}
          >
            <SparkleIcon size={13} />
            {busy ? "Seeding…" : "Seed NorthPulse"}
          </button>
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
        <div className="text-danger text-sm border border-danger/40 bg-dangerSoft rounded px-3 py-2 reveal">
          {err}
        </div>
      )}

      {/* Integrations */}
      <section className="mt-6 reveal-3">
        <div className="divider mb-4">
          <span>Integrations · 03</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((it, i) => (
            <IntegrationCard key={it.name} idx={i + 1} {...it} />
          ))}
        </div>
      </section>

      {/* Brand card */}
      {brand && (
        <section className="mt-10 reveal-4">
          <div className="divider mb-4">
            <span>The Brand on File</span>
          </div>
          <div className="card p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <div className="eyebrow eyebrow-brand no-rules">Active dossier</div>
                <div className="h1 !text-[52px] mt-2">{brand.name}</div>
                <div className="mt-2 serif-italic text-[20px] muted">
                  {brand.tagline}
                </div>
              </div>
              <div className="tag tag-good mono">
                <span className="dot dot-green mr-1" /> Loaded
              </div>
            </div>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Field k="Voice" v={brand.voice} wide />
              <Field k="Audience" v={brand.audience} wide />
              <Field k="Website" v={brand.website} />
              <Field
                k="Instagram"
                v={brand.ig_username && "@" + brand.ig_username}
              />
              <div className="md:col-span-2">
                <div className="field-label">Pillars</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(brand.pillars_json || []).map((p: any) => (
                    <span key={p.name} className="tag">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Demo script */}
      <section className="mt-10 reveal-4">
        <div className="divider mb-4">
          <span>The Demo · 60 seconds</span>
        </div>
        <div className="card p-8">
          <ol className="editorial-list">
            <li>Hit <b>Seed NorthPulse</b> above.</li>
            <li>
              Open <b>Chat</b>: ask{" "}
              <span className="serif-italic">"What do you know about our brand?"</span>{" "}
              then{" "}
              <span className="serif-italic">
                "Plan me 7 days, focus Trail Hoodie drop, IG + FB."
              </span>
            </li>
            <li>
              Head to <b>Calendar</b>. Every draft carries a{" "}
              <span className="serif-italic">"Why now"</span> citing a
              specific memory. Edit and Publish.
            </li>
            <li>
              Open <b>Competitors</b>, track a real IG business handle. Watch
              memories appear in Hindsight in real time.
            </li>
            <li>
              Return to <b>Chat</b>:{" "}
              <span className="serif-italic">
                "How is @rival different from us?"
              </span>{" "}
              — the agent reads from its notes.
            </li>
            <li>
              Open <b>Memory</b>, tap <b>Reflect</b> on{" "}
              <span className="serif-italic">"what makes our posts work?"</span>{" "}
              — the killer moment.
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}

function IntegrationCard({
  idx,
  name,
  info,
  body,
  env,
  href,
  note,
}: {
  idx: number;
  name: string;
  info: any;
  body: string;
  env: string;
  href?: string;
  note: string;
}) {
  const state = !info?.configured
    ? { dot: "dot-gray", label: "Not configured", tone: "tag" }
    : info?.reachable
      ? { dot: "dot-green", label: "Reachable", tone: "tag-good" }
      : { dot: "dot-amber", label: "Configured", tone: "tag-warn" };
  return (
    <article className="card p-6 flex flex-col h-full">
      <div className="flex items-baseline justify-between">
        <div className="mono text-[10.5px] muted">
          №&nbsp;{String(idx).padStart(2, "0")}
        </div>
        <span className={"tag mono " + state.tone}>
          <span className={"dot " + state.dot + " mr-1"} /> {state.label}
        </span>
      </div>
      <h3 className="h2 !text-[28px] mt-3">{name}</h3>
      <p className="mt-3 text-[13.5px] muted leading-relaxed">{note}</p>
      <div className="mt-4 pt-4 border-t border-rule text-[12.5px]">
        {body}
      </div>
      <div className="mt-4 mono text-[10.5px] soft">{env}</div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="link-underline text-[12.5px] mt-2 inline-block"
        >
          Get keys ↗
        </a>
      )}
    </article>
  );
}

function Field({
  k,
  v,
  wide = false,
}: {
  k: string;
  v: any;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <div className="field-label">{k}</div>
      <div className="text-ink whitespace-pre-wrap leading-relaxed">
        {v || <span className="soft italic">—</span>}
      </div>
    </div>
  );
}
