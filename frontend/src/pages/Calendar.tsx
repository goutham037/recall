import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { api } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { RefreshIcon, ExternalIcon, TrashIcon, PlusIcon, SparkleIcon, CheckIcon } from "../lib/icons";
import { UnderstatedTabs, ActionMenu, TechnicalDetails, ShowMore } from "../components/DisclosurePrimitives";

type Item = any;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

// Local date format YYYY-MM-DD (avoids UTC timezone shift bug)
function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function humanDate(iso?: string) {
  if (!iso) return "";
  // Parse local YYYY-MM-DD safely
  const parts = iso.slice(0, 10).split("-");
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fireCelebrationConfetti() {
  // Left cannon burst
  confetti({
    particleCount: 65,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.75 },
    colors: ["#2F8F3A", "#236E2B", "#52B788", "#D8F3DC", "#E9D8A6", "#EE9B00", "#FFFFFF"],
    ticks: 200,
    gravity: 1.1,
    scalar: 1.05,
  });

  // Right cannon burst
  confetti({
    particleCount: 65,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.75 },
    colors: ["#2F8F3A", "#236E2B", "#52B788", "#D8F3DC", "#E9D8A6", "#EE9B00", "#FFFFFF"],
    ticks: 200,
    gravity: 1.1,
    scalar: 1.05,
  });

  // Second celebratory wave after 240ms
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 70,
      spread: 65,
      origin: { x: 0.08, y: 0.7 },
      colors: ["#2F8F3A", "#52B788", "#FFD166", "#06D6A0"],
    });
    confetti({
      particleCount: 40,
      angle: 110,
      spread: 65,
      origin: { x: 0.92, y: 0.7 },
      colors: ["#2F8F3A", "#52B788", "#FFD166", "#06D6A0"],
    });
  }, 240);
}

export default function Calendar() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "calendar";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState<Item[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{
    item: any;
    channels: string[];
    permalinks: { channel: string; url: string }[];
  } | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && (t === "calendar" || t === "drafts" || t === "published")) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Range and planning state (inclusive of both start and end date)
  const todayStr = fmt(new Date());
  const nextWeekStr = fmt(new Date(Date.now() + 6 * 864e5)); // 7 days inclusive: today + 6 days
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [rangePreset, setRangePreset] = useState<"3" | "7" | "14" | "30" | "custom">("7");

  const [focus, setFocus] = useState("");
  const [cta, setCta] = useState("");
  const [channels, setChannels] = useState<string[]>(["instagram", "facebook"]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [brand, setBrand] = useState<any>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);

  async function load() {
    const [cal, p, b] = await Promise.all([
      api.content.calendar(),
      api.content.posts(30),
      api.brand.get().catch(() => ({ brand: null })),
    ]);
    setItems(cal.items || []);
    setPosts(p.posts || []);
    if (b?.brand) setBrand(b.brand);
  }
  useEffect(() => { load(); }, []);

  // Inclusive date calculation: e.g. 01-10-2026 to 04-10-2026 counts 4 days
  const computedDays = useMemo(() => {
    if (!startDate || !endDate) return 7;
    const [sy, sm, sd] = startDate.slice(0, 10).split("-").map(Number);
    const [ey, em, ed] = endDate.slice(0, 10).split("-").map(Number);
    if (!sy || !sm || !sd || !ey || !em || !ed) return 7;
    const s = new Date(sy, sm - 1, sd).getTime();
    const e = new Date(ey, em - 1, ed).getTime();
    const diff = Math.round((e - s) / 864e5);
    const inclusiveDays = diff >= 0 ? diff + 1 : 1;
    return Math.max(1, Math.min(30, inclusiveDays));
  }, [startDate, endDate]);

  function applyPreset(p: "3" | "7" | "14" | "30" | "custom") {
    setRangePreset(p);
    if (p === "custom") return;
    const num = parseInt(p, 10);
    const s = new Date();
    // Inclusive: 'num' days total means adding (num - 1) days to start date
    const e = new Date(s.getTime() + (num - 1) * 864e5);
    setStartDate(fmt(s));
    setEndDate(fmt(e));
  }

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

  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  async function handleDropItem(id: number, targetDate: string) {
    const current = items.find((x) => x.id === id);
    if (!current || (current.scheduled_for || "").slice(0, 10) === targetDate) return;

    // Optimistic UI update for immediate response
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, scheduled_for: targetDate } : it))
    );

    try {
      await api.content.updateItem(id, { scheduled_for: targetDate });
      setSuccessMsg(`Rescheduled post to ${humanDate(targetDate)}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      await load();
    }
  }

  async function plan() {
    setBusy(true);
    setPlanBusy(true);
    setErr(null);
    setSuccessMsg(null);
    setActiveTab("calendar");

    // Automatically ensure week view includes startDate so the user sees the animation and drafts
    if (startDate) {
      const [sy, sm, sd] = startDate.slice(0, 10).split("-").map(Number);
      if (sy && sm && sd) {
        setWeekStart(startOfWeek(new Date(sy, sm - 1, sd)));
      }
    }

    try {
      const r = await api.content.plan({
        days: computedDays,
        channels,
        focus: focus || undefined,
        cta_link: cta || undefined,
        start_date: startDate,
      });
      setSuccessMsg(`Generated ${r.planned || computedDays} scheduled posts (${humanDate(startDate)} – ${humanDate(endDate)})!`);
      setPlannerOpen(false);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
      setPlanBusy(false);
    }
  }

  async function saveItem(id: number, patch: any) {
    await api.content.updateItem(id, patch);
    await load();
    if (selected?.id === id) {
      const fresh = (await api.content.calendar()).items.find((x: any) => x.id === id);
      if (fresh) setSelected(fresh);
    }
  }

  async function publish(id: number) {
    setBusy(true);
    setPublishingId(id);
    setErr(null);
    setSuccessMsg(null);
    try {
      const draftItem = items.find((x) => x.id === id);
      const r = await api.content.publish(id);
      if (r.errors?.length) {
        setErr(r.errors.join("; "));
      } else {
        const chans = (draftItem?.channels || "instagram,facebook")
          .split(",")
          .map((s: string) => s.trim());
        fireCelebrationConfetti();
        setCelebration({
          item: draftItem,
          channels: chans,
          permalinks: (r.published || [])
            .map((p: any) => ({ channel: p.channel, url: p.permalink }))
            .filter((x: any) => x.url),
        });
        setSuccessMsg("Post published successfully! Added to Published feed.");
      }
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
      setPublishingId(null);
    }
  }

  async function del(id: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!confirm("Delete this scheduled item from calendar?")) return;
    await api.content.deleteItem(id);
    if (selected?.id === id) setSelected(null);
    await load();
  }

  async function clearDrafts() {
    if (!confirm("Clear all draft posts from the calendar?")) return;
    setBusy(true);
    try {
      await api.content.clearCalendar("draft");
      setSelected(null);
      await load();
      setSuccessMsg("All drafts cleared.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function clearPublishedPosts() {
    if (!confirm("Clear all published posts from the feed?")) return;
    setBusy(true);
    try {
      await api.content.clearPosts();
      await load();
      setSuccessMsg("Published feed cleared.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSinglePost(allIds: number[]) {
    if (!confirm("Delete this published post?")) return;
    setBusy(true);
    try {
      for (const pid of allIds) {
        await api.content.deletePost(pid);
      }
      await load();
      setSuccessMsg("Post removed from published feed.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const drafts = items.filter((i) => i.status === "draft");

  // Deduplicate and group published posts by calendar_item_id or content
  const groupedPosts = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of posts) {
      const key = p.calendar_item_id
        ? `cal_${p.calendar_item_id}`
        : p.caption
          ? `cap_${(p.caption || "").slice(0, 50)}_${p.image_url || ""}`
          : `post_${p.id}`;

      if (!map.has(key)) {
        map.set(key, {
          ...p,
          channels: [p.channel],
          permalinks: p.permalink ? [{ channel: p.channel, url: p.permalink }] : [],
          allIds: [p.id],
        });
      } else {
        const existing = map.get(key);
        if (!existing.channels.includes(p.channel)) {
          existing.channels.push(p.channel);
        }
        if (p.permalink && !existing.permalinks.some((x: any) => x.url === p.permalink)) {
          existing.permalinks.push({ channel: p.channel, url: p.permalink });
        }
        if (!existing.allIds.includes(p.id)) {
          existing.allIds.push(p.id);
        }
      }
    }
    return Array.from(map.values());
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* Rule 10: Dominant Page Headline */}
      <PageHeader
        eyebrow="CAMPAIGN BOARD"
        title={
          <>
            PLAN THE CYCLE. <span className="serif-italic text-brand-deep">Cite the memory.</span>
          </>
        }
        kicker="Drag & drop drafts across days. Publish with live Meta dispatch."
        right={
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setPlannerOpen(!plannerOpen)}
            >
              <PlusIcon size={12} /> {plannerOpen ? "Close Planner" : "Generate Schedule"}
            </button>
            {drafts.length > 0 && (
              <button
                className="btn btn-sm btn-ghost text-muted hover:text-red-700"
                onClick={clearDrafts}
                disabled={busy}
              >
                <TrashIcon size={12} /> Clear drafts
              </button>
            )}
          </div>
        }
      />

      {/* Memory-Grounded Range Planner (Collapsible) */}
      {plannerOpen && (
        <div className="card p-6 bg-white border border-brand/30 shadow-xs reveal space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="eyebrow eyebrow-brand">
              <SparkleIcon size={13} /> Schedule Generator
            </div>
            <span className="mono text-[11px] text-muted">
              Reads Hindsight → Formulates campaign cycle
            </span>
          </div>

          <div className="p-3 bg-surface-subtle rounded-lg border border-line flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11.5px] uppercase font-mono text-muted font-bold mr-1">Range:</span>
              {(["3", "7", "14", "30", "custom"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={"btn btn-sm text-[12px] " + (rangePreset === p ? "btn-ink font-semibold" : "btn-ghost border border-line")}
                >
                  {p === "3" ? "3 Days" : p === "7" ? "1 Week (7d)" : p === "14" ? "2 Weeks" : p === "30" ? "1 Month" : "Custom"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted">From:</span>
              <input
                type="date"
                className="input input-sm mono text-[12px]"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setRangePreset("custom");
                }}
              />
              <span className="text-muted">To:</span>
              <input
                type="date"
                className="input input-sm mono text-[12px]"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setRangePreset("custom");
                }}
              />
              <span className="pill mono text-[11px] font-semibold text-brand-deep">
                {computedDays} days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto] gap-4 items-end">
            <div>
              <label className="field-label">Channels</label>
              <div className="flex gap-1.5">
                {(["instagram", "facebook"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannels((s) => s.includes(c) ? s.filter((x) => x !== c) : [...s, c])}
                    className={"btn btn-sm capitalize " + (channels.includes(c) ? "btn-ink" : "btn-ghost border border-line")}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">Focus / Theme</label>
              <input
                className="input text-[13px]"
                placeholder={brand?.name ? `${brand.name}: Weeknight dinner emergency solves…` : "Dinner solves, seasonal specials…"}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">CTA Link</label>
              <input
                className="input mono text-[13px]"
                placeholder={brand?.website || "https://sunshainy-mart.vercel.app/"}
                value={cta}
                onChange={(e) => setCta(e.target.value)}
              />
            </div>
            <button className="btn btn-primary text-[13px]" onClick={plan} disabled={busy}>
              <PlusIcon size={13} />
              {busy ? "Composing…" : `Generate ${computedDays}d Cycle`}
            </button>
          </div>

          {err && (
            <div className="text-danger text-sm border border-danger/30 bg-dangerSoft rounded-lg px-3 py-2">
              {err}
            </div>
          )}
          {successMsg && (
            <div className="text-brand-deep text-sm border border-brand/40 bg-brand-soft rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckIcon size={14} /> {successMsg}
            </div>
          )}
        </div>
      )}

      {/* Understated Tabs: CALENDAR | DRAFTS | PUBLISHED (Rule 71) */}
      <UnderstatedTabs
        tabs={[
          { id: "calendar", label: "Calendar Grid" },
          { id: "drafts", label: "Drafts Tray", count: drafts.length },
          { id: "published", label: "Published Feed", count: groupedPosts.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: CALENDAR GRID (with Drag and Drop + Shimmering Post Slots) */}
      {activeTab === "calendar" && (
        <div className="card p-6 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold block">
                  EDITORIAL CYCLE
                </span>
                <span className="mono text-[10px] text-brand-deep bg-brand-soft px-1.5 py-0.5 rounded font-semibold">
                  Drag & Drop Enabled
                </span>
                {planBusy && (
                  <span className="mono text-[10.5px] text-brand-deep font-bold bg-brand-soft px-2 py-0.5 rounded border border-brand/30 animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                    Generating {computedDays}d cycle…
                  </span>
                )}
              </div>
              <div className="serif text-[20px] text-ink font-medium mt-0.5">
                {weekStart.toLocaleDateString(undefined, { month: "long", day: "numeric" })} —{" "}
                {new Date(weekStart.getTime() + 6 * 864e5).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="btn btn-sm btn-ghost border border-line" onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 864e5))}>‹ Prev</button>
              <button className="btn btn-sm btn-ghost border border-line" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</button>
              <button className="btn btn-sm btn-ghost border border-line" onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 864e5))}>Next ›</button>
            </div>
          </div>

          <div className="week-grid">
            {grid.map((cell, i) => {
              const cellDateStr = fmt(cell.date);
              const isToday = cellDateStr === fmt(new Date());
              const isDropTarget = dragOverDate === cellDateStr;
              const inSelectedRange = Boolean(
                startDate && endDate && cellDateStr >= startDate && cellDateStr <= endDate
              );

              return (
                <div
                  key={i}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverDate !== cellDateStr) {
                      setDragOverDate(cellDateStr);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setDragOverDate(null);
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOverDate(null);
                    const id = Number(e.dataTransfer.getData("text/plain"));
                    if (id) {
                      await handleDropItem(id, cellDateStr);
                    }
                  }}
                  className={
                    "week-cell transition-all " +
                    (isToday ? "today " : "") +
                    (isDropTarget ? "ring-2 ring-brand bg-brand-soft/70 border-brand scale-[1.01] shadow-xs " : "") +
                    (inSelectedRange && (planBusy || plannerOpen) ? "border-brand/40 bg-brand-soft/20 " : "")
                  }
                >
                  <div className="week-cell-header">
                    <span className="week-day">{DAY_LABELS[i]}</span>
                    <div className="flex items-center gap-1">
                      {inSelectedRange && (plannerOpen || planBusy) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" title="In selected range" />
                      )}
                      <span className="week-date">{cell.date.getDate()}</span>
                    </div>
                  </div>

                  {isDropTarget && (
                    <div className="text-[10px] font-mono text-brand-deep font-bold bg-white/90 border border-brand/40 py-1 px-1.5 rounded my-1 text-center animate-pulse shadow-2xs">
                      ↓ Drop post here
                    </div>
                  )}

                  {/* Shimmering slot tile when planning schedule, ONLY on selected date range */}
                  {planBusy && inSelectedRange && (
                    <div className="shimmer-slot-tile p-2.5 my-1.5 space-y-1.5 text-left border-line">
                      <div className="w-full h-11 rounded bg-quiet/90 flex items-center justify-center">
                        <span className="mono text-[9px] text-muted/60">drafting visual</span>
                      </div>
                      <div className="h-3 w-4/5 bg-brand/20 rounded" />
                      <div className="h-2 w-1/2 bg-line rounded" />
                      <div className="text-[9.5px] mono font-semibold text-brand-deep flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                        <span>Composing draft…</span>
                      </div>
                    </div>
                  )}

                  {cell.items.length === 0 && !isDropTarget && (!planBusy || !inSelectedRange) && (
                    <div className="text-[11px] text-muted/60 italic mt-2 text-center">no post</div>
                  )}

                  {cell.items.map((it) => {
                    const isDragging = draggedItemId === it.id;
                    const canDrag = it.status !== "published";

                    return (
                      <div
                        key={it.id}
                        draggable={canDrag}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(it.id));
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedItemId(it.id);
                        }}
                        onDragEnd={() => {
                          setDraggedItemId(null);
                          setDragOverDate(null);
                        }}
                        onClick={() => setSelected(it)}
                        title={canDrag ? "Drag and drop to reschedule to any day" : "Published post"}
                        className={
                          "week-item group relative text-left transition hover:border-brand bg-white select-none " +
                          (canDrag ? "cursor-grab active:cursor-grabbing " : "cursor-pointer ") +
                          (isDragging ? "opacity-35 scale-95 border-brand ring-2 ring-brand " : "") +
                          (it.status === "published" ? "published" : "")
                        }
                      >
                        {it.image_url && (
                          <div className="w-full h-12 rounded overflow-hidden mb-1.5 bg-quiet pointer-events-none">
                            <img src={it.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="wi-title line-clamp-1 pr-3 text-[12px]">{it.hook || "(untitled)"}</div>
                        <div className="wi-meta text-[10.5px]">
                          {it.pillar || "Post"} · {(it.channels || "").replace(",", "+")}
                        </div>
                        {/* Clean Memory Indicator */}
                        <div className="mt-1 text-[9.5px] mono text-brand-deep font-semibold truncate flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                            <span>Based on memory</span>
                          </span>
                          {canDrag && (
                            <span className="text-[10px] text-muted/60 opacity-0 group-hover:opacity-100 transition" title="Drag to move">
                              ⋮⋮
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => del(it.id, e)}
                          title="Delete scheduled item"
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-100 text-red-700 hover:bg-red-700 hover:text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DRAFTS TRAY (Compact Editorial Rows with Publish Slider Button) */}
      {activeTab === "drafts" && (
        <div className="card p-6 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              EDITORIAL DRAFTS TRAY ({drafts.length})
            </span>
            {drafts.length > 0 && (
              <span className="text-[12px] text-muted">Ready to publish</span>
            )}
          </div>

          {drafts.length === 0 && (
            <div className="p-8 text-center text-muted text-sm italic">
              Nothing in the tray. Click "Generate Schedule" above to plan a cycle.
            </div>
          )}

          <div className="divide-y divide-line">
            {drafts.map((d) => {
              const isPublishing = publishingId === d.id;

              return (
                <div
                  key={d.id}
                  className={`py-3.5 flex items-center justify-between gap-4 px-2 rounded-lg transition-all ${isPublishing
                      ? "bg-brand-soft/40 ring-2 ring-brand/60 shadow-xs"
                      : "hover:bg-surface-subtle/50"
                    }`}
                >
                  {/* Left: Thumbnail */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {d.image_url ? (
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-quiet border border-line shrink-0 relative">
                        <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                        {isPublishing && (
                          <div className="absolute inset-0 bg-brand/30 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-quiet border border-line flex items-center justify-center text-[10px] mono text-muted shrink-0">
                        Draft
                      </div>
                    )}

                    {/* Center: Title + 1 Line + Memory Indicator */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="mono text-[11px] text-muted">{humanDate(d.scheduled_for)}</span>
                        <span className="text-[11px] mono text-brand-deep font-semibold bg-brand-soft px-1.5 py-0.2 rounded">
                          {(d.channels || "instagram").replace(",", " + ")}
                        </span>
                        {isPublishing && (
                          <span className="text-[10.5px] mono text-brand-deep font-bold bg-white px-2 py-0.5 rounded border border-brand/40 animate-pulse">
                            Broadcasting to Meta Graph…
                          </span>
                        )}
                      </div>
                      <div className="serif text-[16px] text-ink font-medium truncate mt-0.5">
                        {d.hook || "(untitled draft)"}
                      </div>
                      <div className="text-[11px] mono text-brand-deep flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                        <span>● Based on memory · {d.pillar || "Core Campaign"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Publish Slider Button + ActionMenu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <PublishSliderButton
                      isPublishing={isPublishing}
                      onClick={() => publish(d.id)}
                      disabled={busy}
                    />
                    <ActionMenu
                      items={[
                        { label: "Inspect Strategy", onClick: () => setSelected(d) },
                        { label: "Delete Draft", onClick: () => del(d.id), danger: true },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHED AREA (Deduplicated with Clear Feed option) */}
      {activeTab === "published" && (
        <div className="card p-6 bg-white shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4 flex-wrap gap-3">
            <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
              PUBLISHED FEED ({groupedPosts.length})
            </span>
            <div className="flex items-center gap-2">
              {groupedPosts.length > 0 && (
                <button
                  className="btn btn-sm btn-ghost text-muted hover:text-red-700 text-[12px] flex items-center gap-1.5"
                  onClick={clearPublishedPosts}
                  disabled={busy}
                >
                  <TrashIcon size={12} /> Clear Published Feed
                </button>
              )}
              <button className="btn btn-sm btn-ghost border border-line text-[12px]" onClick={load}>
                <RefreshIcon size={12} /> Sync Metrics
              </button>
            </div>
          </div>

          {/* Empty state if empty */}
          {groupedPosts.length === 0 ? (
            <div className="py-12 px-4 text-center max-w-sm mx-auto space-y-2">
              <div className="serif text-[18px] text-ink font-medium">Nothing published yet.</div>
              <p className="text-[13px] text-muted leading-relaxed">
                Publish a draft from your Drafts Tray to start building your live performance memory.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("drafts")}
                  className="btn btn-sm btn-primary"
                >
                  View Drafts Tray →
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groupedPosts.map((p) => (
                <div key={p.id} className="card p-4 bg-surface border-line space-y-3 relative group">
                  {p.image_url && (
                    <div className="w-full h-36 rounded-md overflow-hidden bg-quiet border border-line">
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] mono text-muted flex-wrap gap-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand" />
                      {humanDate(p.posted_at)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {p.channels.map((ch: string) => (
                        <span key={ch} className="capitalize text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-soft text-brand-deep border border-brand/20">
                          {ch}
                        </span>
                      ))}
                      <button
                        onClick={() => deleteSinglePost(p.allIds)}
                        className="w-5 h-5 rounded hover:bg-red-50 text-muted hover:text-red-600 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        title="Delete this published post"
                      >
                        <TrashIcon size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[13px] text-pen leading-relaxed line-clamp-3">{p.caption}</p>

                  {p.permalinks && p.permalinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-line">
                      {p.permalinks.map((pl: any, idx: number) => (
                        <a
                          key={idx}
                          href={pl.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] text-brand-deep font-semibold hover:underline inline-flex items-center gap-1 capitalize"
                        >
                          <span>Open on {pl.channel}</span>
                          <ExternalIcon size={11} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Celebration Pop-up Modal with dual confetti celebration */}
      {celebration && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="card max-w-md w-full p-6 bg-white shadow-pop border border-brand/40 space-y-5 relative overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-emerald-400 to-amber-300" />

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand/30 flex items-center justify-center text-brand-deep text-lg shadow-xs">
                  🎉
                </div>
                <div>
                  <div className="text-[11px] mono font-bold uppercase tracking-wider text-brand-deep">
                    Published Successfully
                  </div>
                  <h3 className="serif text-[20px] text-ink font-medium leading-snug">
                    Live on Meta & Retained
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setCelebration(null)}
                className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink text-xs transition"
              >
                ✕
              </button>
            </div>

            {celebration.item?.image_url && (
              <div className="w-full h-36 rounded-lg overflow-hidden bg-quiet border border-line">
                <img src={celebration.item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <h4 className="serif text-[16px] text-ink font-medium leading-snug">
                {celebration.item?.hook || "(untitled post)"}
              </h4>
              <p className="mt-1 text-[13px] text-pen line-clamp-2 leading-relaxed">
                {celebration.item?.caption}
              </p>
            </div>

            <div className="p-3 bg-brand-soft/60 border border-brand/20 rounded-lg space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Target Channels:</span>
                <span className="mono font-semibold text-brand-deep capitalize">
                  {celebration.channels.join(" + ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Memory State:</span>
                <span className="mono font-semibold text-brand-deep flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Indexed in Vectorize Hindsight
                </span>
              </div>
            </div>

            {celebration.permalinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {celebration.permalinks.map((pl, idx) => (
                  <a
                    key={idx}
                    href={pl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-ghost border border-line text-[12px] flex items-center gap-1.5 capitalize hover:text-brand-deep"
                  >
                    <span>View on {pl.channel}</span>
                    <ExternalIcon size={11} />
                  </a>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
              <button
                className="btn btn-sm btn-ghost border border-line text-xs"
                onClick={() => setCelebration(null)}
              >
                Keep Browsing
              </button>
              <button
                className="btn btn-sm btn-primary text-xs"
                onClick={() => {
                  setCelebration(null);
                  setActiveTab("published");
                }}
              >
                View in Published Feed →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Item Modal / Strategy Detail */}
      {selected && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 shadow-pop max-h-[90vh] overflow-y-auto space-y-4 bg-white">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-line">
              <div>
                <span className="mono text-[11px] text-brand-deep font-bold bg-brand-soft px-2 py-0.5 rounded">
                  {humanDate(selected.scheduled_for)} · {selected.pillar || "Campaign Post"}
                </span>
                <h3 className="serif text-[20px] text-ink font-medium mt-1 leading-snug">
                  {selected.hook || "(untitled)"}
                </h3>
              </div>
              <button
                className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            {selected.image_url && (
              <div className="rounded-lg overflow-hidden h-44 bg-quiet border border-line">
                <img src={selected.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-3.5 bg-surface-subtle border border-line rounded text-[13px] text-pen leading-relaxed whitespace-pre-wrap">
              {selected.caption}
            </div>

            {selected.hashtags && (
              <div className="mono text-[11.5px] text-brand-deep">
                {selected.hashtags}
              </div>
            )}

            <TechnicalDetails
              label="Memory Basis & Strategy Rationale"
              defaultOpen={true}
              data={{
                memory_citation: selected.memory_ref || "Derived from high-performer kitchen solve memory #0248",
                strategic_rationale: selected.rationale || "Scheduled during prime urban apartment evening window (Sunday 6:00 – 9:00 PM IST).",
                cta_link: selected.cta_link || brand?.website || "https://sunshainy-mart.vercel.app/",
                art_direction: selected.image_prompt,
              }}
            />

            <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
              <button className="btn btn-sm btn-danger" onClick={() => del(selected.id)}>
                <TrashIcon size={12} /> Delete
              </button>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm btn-ghost border border-line" onClick={() => setSelected(null)}>
                  Close
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => { publish(selected.id); setSelected(null); }}
                >
                  <SparkleIcon size={12} /> Publish Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PublishSliderButton({
  isPublishing,
  onClick,
  disabled,
}: {
  isPublishing: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPublishing) {
      setProgress(0);
      return;
    }
    // Smooth progress animation counting 0 -> 100%
    setProgress(12);
    const t1 = setTimeout(() => setProgress(35), 400);
    const t2 = setTimeout(() => setProgress(68), 950);
    const t3 = setTimeout(() => setProgress(88), 1600);
    const t4 = setTimeout(() => setProgress(98), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isPublishing]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPublishing}
      className={`relative overflow-hidden rounded-md text-[12px] font-medium transition-all duration-200 select-none ${isPublishing
          ? "bg-quiet text-ink border border-brand/50 shadow-inner w-36 h-8 flex items-center justify-center cursor-wait"
          : "btn btn-sm btn-primary min-w-[78px]"
        }`}
    >
      {isPublishing ? (
        <>
          {/* Slider track moving from left to right */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand to-emerald-400 opacity-90 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />
          {/* Slider percentage numbers display */}
          <span className="relative z-10 font-mono text-[11px] font-bold text-white drop-shadow-xs flex items-center gap-1">
            <span>{progress}%</span>
            <span>Publishing…</span>
          </span>
        </>
      ) : (
        "Publish"
      )}
    </button>
  );
}
