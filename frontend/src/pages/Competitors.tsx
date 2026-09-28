import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { PlusIcon, RefreshIcon, ExternalIcon } from "../lib/icons";

export default function Competitors() {
  const [rows, setRows] = useState<any[]>([]);
  const [handle, setHandle] = useState("");
  const [channel, setChannel] = useState<"instagram" | "facebook">("instagram");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  async function load() {
    const r = await api.competitors.list();
    setRows(r.competitors || []);
  }
  useEffect(() => { load(); }, []);

  async function loadPosts(h: string) {
    setSelected(h);
    const r = await api.competitors.posts(h, 20);
    setPosts(r.posts || []);
  }
  async function track() {
    if (!handle) return;
    setBusy(true); setErr(null);
    try { await api.competitors.track(handle, channel); setHandle(""); await load(); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function resync(h: string, ch: string) {
    setBusy(true); setErr(null);
    try {
      await api.competitors.track(h, ch as any);
      if (selected === h) await loadPosts(h);
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const totalRemembered = rows.reduce((n, r) => n + (r.post_count || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Competitors"
        title={<>Watch, and <span className="serif-italic text-brand-deep">remember.</span></>}
        kicker={`Every rival post gets filed in Hindsight tagged competitor:<handle>. Ask the agent later: "how is @X different from us?" and it will read from its notes. ${rows.length} tracked · ${totalRemembered} posts remembered.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 reveal-3">
        <div className="card p-6">
          <div className="eyebrow eyebrow-brand"><PlusIcon size={13} /> Track a rival</div>
          <div className="h2 mt-2 mb-5">Add to the watch list.</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
            <div>
              <label className="field-label">
                {channel === "instagram" ? "IG username (no @)" : "FB Page ID"}
              </label>
              <input className="input mono" placeholder={channel === "instagram" ? "onrunning" : "1234567890"} value={handle} onChange={(e) => setHandle(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Channel</label>
              <div className="flex gap-1.5">
                {(["instagram", "facebook"] as const).map((c) => (
                  <button key={c} onClick={() => setChannel(c)} className={"btn btn-sm " + (channel === c ? "btn-ink" : "")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={track} disabled={busy || !handle}>
              <PlusIcon size={13} /> {busy ? "Fetching…" : "Track"}
            </button>
          </div>
          {err && (
            <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
              {err}
            </div>
          )}
        </div>

        <div className="card-quiet p-6">
          <div className="eyebrow mb-3"><span className="dot-lead" /> How it works</div>
          <p className="text-[13px] text-muted leading-relaxed">
            Fetched posts get retained to Hindsight with tag{" "}
            <span className="tag mono">competitor:handle</span>. Ask the agent{" "}
            <span className="serif-italic text-ink">"how is @X different from us?"</span>{" "}
            and it will cite them.
          </p>
          <div className="hr-soft my-4" />
          <p className="text-[13px] text-muted leading-relaxed">
            <span className="font-semibold text-ink">Note:</span> Instagram uses{" "}
            Business Discovery — the target must be a public IG Business or
            Creator account. Facebook Pages need Public Content Access.
          </p>
        </div>
      </div>

      <div className="section-divider">The Watch List · {rows.length} tracked · {totalRemembered} posts</div>
      {rows.length === 0 && (
        <div className="card p-12 text-center">
          <div className="h2 serif-italic text-muted">Nothing under watch.</div>
          <div className="mt-2 text-sm text-muted">Add a rival above.</div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((c) => (
          <button
            key={c.id}
            onClick={() => loadPosts(c.handle)}
            className={"card p-5 text-left hover-lift " + (selected === c.handle ? "!border-brand shadow-cardHover" : "")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="serif text-[24px] leading-tight tracking-tighter2">
                  {c.display_name || c.handle}
                </div>
                <div className="mono text-[11px] text-muted mt-1">
                  @{c.handle} · {c.channel}
                </div>
              </div>
              <span
                className="btn btn-sm"
                onClick={(e) => { e.stopPropagation(); resync(c.handle, c.channel); }}
              >
                <RefreshIcon size={12} />
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="tag tag-brand mono">{c.post_count || 0} filed</span>
              {c.last_synced_at && (
                <span className="tag mono">{new Date(c.last_synced_at).toLocaleDateString()}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-8 card p-6 reveal">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="eyebrow eyebrow-brand"><span className="dot-lead" /> Dispatches</div>
              <div className="h2 mt-2">
                Filed under <span className="mono !text-[18px]">competitor:{selected}</span>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => resync(selected, "instagram")}>
              <RefreshIcon size={13} /> Resync
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {posts.map((p) => (
              <article key={p.id} className="card-quiet p-4">
                <div className="mono text-[11px] text-muted">
                  {p.posted_at ? new Date(p.posted_at).toLocaleString() : "—"}
                </div>
                <div className="text-[13.5px] mt-2 whitespace-pre-wrap line-clamp-6 leading-relaxed">
                  {p.caption}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="tag mono">♥ {p.likes ?? "—"}</span>
                  <span className="tag mono">✎ {p.comments ?? "—"}</span>
                  {p.permalink && (
                    <a className="btn btn-sm ml-auto" href={p.permalink} target="_blank" rel="noreferrer">
                      <ExternalIcon size={12} /> Open
                    </a>
                  )}
                </div>
              </article>
            ))}
            {posts.length === 0 && (
              <div className="text-sm text-muted italic col-span-full">
                No dispatches yet — try Resync.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
