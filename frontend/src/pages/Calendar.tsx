import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { PageHead } from "../components/Shell";
import { RefreshIcon, ExternalIcon, TrashIcon, PlusIcon } from "../lib/icons";

type Item = any;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function humanDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Calendar() {
  const [items, setItems] = useState<Item[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [focus, setFocus] = useState("");
  const [cta, setCta] = useState("");
  const [channels, setChannels] = useState<string[]>(["instagram", "facebook"]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));

  async function load() {
    const [cal, p] = await Promise.all([
      api.content.calendar(),
      api.content.posts(20),
    ]);
    setItems(cal.items || []);
    setPosts(p.posts || []);
  }
  useEffect(() => {
    load();
  }, []);

  const grid = useMemo(() => {
    const cells: { date: Date; items: Item[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const key = fmt(d);
      cells.push({
        date: d,
        items: items.filter((it) => (it.scheduled_for || "").slice(0, 10) === key),
      });
    }
    return cells;
  }, [items, weekStart]);

  async function plan() {
    setBusy(true);
    setErr(null);
    try {
      await api.content.plan({
        days,
        channels,
        focus: focus || undefined,
        cta_link: cta || undefined,
      });
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveItem(id: number, patch: any) {
    await api.content.updateItem(id, patch);
    await load();
    if (selected?.id === id) {
      const fresh = (await api.content.calendar()).items.find(
        (x: any) => x.id === id
      );
      if (fresh) setSelected(fresh);
    }
  }
  async function publish(id: number) {
    setBusy(true);
    setErr(null);
    try {
      const r = await api.content.publish(id);
      if (r.errors?.length) setErr(r.errors.join("; "));
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function del(id: number) {
    if (!confirm("Delete this item?")) return;
    await api.content.deleteItem(id);
    setSelected(null);
    await load();
  }
  async function refreshPerf() {
    setBusy(true);
    try {
      await api.content.refreshPerf();
      await load();
    } finally {
      setBusy(false);
    }
  }

  const drafts = items.filter((i) => i.status === "draft");
  const published = items.filter((i) => i.status === "published");

  return (
    <>
      <PageHead
        eyebrow="Section 02 · The Calendar"
        title={
          <>
            Plan the week.{" "}
            <span className="serif-italic text-brand-deep">
              Cite the memory.
            </span>
          </>
        }
        kicker={`A running dossier of drafts, scheduled items and live posts. ${drafts.length} drafts · ${published.length} scheduled · ${posts.length} posted to Meta.`}
        right={
          <button className="btn btn-sm" onClick={refreshPerf} disabled={busy}>
            <RefreshIcon size={13} /> Refresh performance
          </button>
        }
      />

      {/* Planner strip */}
      <section className="card p-6 reveal-3">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="eyebrow eyebrow-brand no-rules">The Planner</div>
            <div className="h2 mt-2">
              Memory-grounded drafts, in one motion.
            </div>
          </div>
          <div className="dateline">Reads Hindsight → Groq → your calendar</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[90px_auto_1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="field-label">Days</label>
            <input
              type="number"
              className="input mono"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value || "7"))}
            />
          </div>
          <div>
            <label className="field-label">Channels</label>
            <div className="flex gap-1.5">
              {(["instagram", "facebook"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    setChannels((s) =>
                      s.includes(c) ? s.filter((x) => x !== c) : [...s, c]
                    )
                  }
                  className={
                    "btn btn-sm " +
                    (channels.includes(c) ? "btn-ink" : "")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Focus</label>
            <input
              className="input"
              placeholder="Trail Hoodie drop, community week…"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">CTA link</label>
            <input
              className="input mono"
              placeholder="https://…"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={plan} disabled={busy}>
            <PlusIcon size={13} />
            {busy ? "Composing…" : `Plan ${days}d`}
          </button>
        </div>
        {err && (
          <div className="mt-3 text-danger text-sm border border-danger/30 bg-dangerSoft rounded px-3 py-2">
            {err}
          </div>
        )}
      </section>

      {/* Week grid */}
      <section className="mt-10 reveal-4">
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <div>
            <div className="eyebrow no-rules">Week of</div>
            <div className="h2 mt-1 serif-italic">
              {weekStart.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}{" "}
              —{" "}
              {new Date(weekStart.getTime() + 6 * 864e5).toLocaleDateString(
                undefined,
                { month: "long", day: "numeric" }
              )}
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              className="btn btn-sm"
              onClick={() =>
                setWeekStart(new Date(weekStart.getTime() - 7 * 864e5))
              }
            >
              ‹ Prev
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
            >
              Today
            </button>
            <button
              className="btn btn-sm"
              onClick={() =>
                setWeekStart(new Date(weekStart.getTime() + 7 * 864e5))
              }
            >
              Next ›
            </button>
          </div>
        </div>
        <div className="week-grid">
          {grid.map((cell, i) => {
            const isToday = fmt(cell.date) === fmt(new Date());
            return (
              <div
                key={i}
                className={"week-cell " + (isToday ? "today" : "")}
              >
                <div className="week-cell-header">
                  <span className="week-day">{DAY_LABELS[i]}</span>
                  <span className="week-date">{cell.date.getDate()}</span>
                </div>
                {cell.items.length === 0 && (
                  <div className="text-[11px] soft italic mt-2">no dispatch</div>
                )}
                {cell.items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => setSelected(it)}
                    className={
                      "week-item text-left " +
                      (it.status === "published" ? "published" : "")
                    }
                  >
                    <div className="wi-title line-clamp-2">
                      {it.hook || "(untitled)"}
                    </div>
                    <div className="wi-meta">
                      {it.pillar || "no pillar"} · {(it.channels || "").replace(",", " + ")}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Drafts + Published */}
      <section className="mt-10 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        <div>
          <div className="divider mb-4">
            <span>Drafts &nbsp;·&nbsp; {drafts.length}</span>
          </div>
          <div className="space-y-4">
            {drafts.length === 0 && (
              <div className="card p-8 text-center">
                <div className="serif-italic muted">
                  Nothing in the tray. Ask the planner up top.
                </div>
              </div>
            )}
            {drafts.map((i) => (
              <DraftCard
                key={i.id}
                item={i}
                expanded={selected?.id === i.id}
                onSelect={() =>
                  setSelected(selected?.id === i.id ? null : i)
                }
                onSave={(p) => saveItem(i.id, p)}
                onPublish={() => publish(i.id)}
                onDelete={() => del(i.id)}
              />
            ))}
          </div>
        </div>

        <aside>
          <div className="divider mb-4">
            <span>Published &nbsp;·&nbsp; {posts.length}</span>
          </div>
          <div className="space-y-3">
            {posts.length === 0 && (
              <div className="card p-6 text-center serif-italic muted">
                Nothing filed yet.
              </div>
            )}
            {posts.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="dateline flex items-center gap-2">
                  <span className="dot dot-green" />
                  {humanDate(p.posted_at)} · {p.channel}
                </div>
                <div className="text-[13.5px] mt-2 line-clamp-3 whitespace-pre-wrap">
                  {p.caption}
                </div>
                {p.metrics_json && (
                  <div className="mt-2 mono text-[10.5px] text-brand-deep line-clamp-2">
                    {p.metrics_json}
                  </div>
                )}
                {p.permalink && (
                  <a
                    className="btn btn-sm mt-3"
                    href={p.permalink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalIcon size={12} /> Open
                  </a>
                )}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}

function DraftCard({
  item,
  expanded,
  onSelect,
  onSave,
  onPublish,
  onDelete,
}: {
  item: any;
  expanded: boolean;
  onSelect: () => void;
  onSave: (patch: any) => void;
  onPublish: () => void;
  onDelete: () => void;
}) {
  const chans = (item.channels || "").split(",").filter(Boolean);
  return (
    <article className="card p-6">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="tag tag-ink mono">
              {humanDate(item.scheduled_for)}
            </span>
            {item.pillar && <span className="tag">{item.pillar}</span>}
            {chans.map((c: string) => (
              <span key={c} className="tag">
                {c}
              </span>
            ))}
          </div>
          <h3 className="h2 mt-3 !text-[24px]">
            {item.hook || "(untitled)"}
          </h3>
          <p className="mt-2 text-[14px] text-ink/85 whitespace-pre-wrap leading-relaxed">
            {item.caption}
          </p>
          <div className="mt-2 mono text-[11px] text-brand-deep">
            {item.hashtags}
          </div>
          {item.rationale && (
            <blockquote className="mt-4 pl-4 border-l-2 border-brand">
              <div className="eyebrow eyebrow-brand no-rules mb-1">
                Why now
              </div>
              <div className="serif-italic text-[15px] leading-relaxed">
                {item.rationale}
              </div>
            </blockquote>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button className="btn btn-sm" onClick={onSelect}>
            {expanded ? "Collapse" : "Edit"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={onPublish}>
            Publish
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-5 pt-5 border-t border-rule grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Caption</label>
            <textarea
              className="textarea"
              defaultValue={item.caption}
              onBlur={(e) => onSave({ caption: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Hashtags</label>
            <textarea
              className="textarea mono"
              defaultValue={item.hashtags}
              onBlur={(e) => onSave({ hashtags: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Image URL (required for IG)</label>
            <input
              className="input mono"
              defaultValue={item.image_url || ""}
              placeholder="Public https:// image link"
              onBlur={(e) => onSave({ image_url: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">CTA link</label>
            <input
              className="input mono"
              defaultValue={item.cta_link || ""}
              onBlur={(e) => onSave({ cta_link: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 text-[12.5px] muted">
            <span className="eyebrow no-rules mr-2">Art Direction</span>
            {item.image_prompt}
          </div>
          <button className="btn btn-danger btn-sm mt-1" onClick={onDelete}>
            <TrashIcon size={12} /> Delete
          </button>
        </div>
      )}
    </article>
  );
}
