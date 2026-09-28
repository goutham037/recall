import { useEffect, useRef, useState } from "react";
import { api, ChatReply } from "../lib/api";
import { PageHeader } from "../components/Shell";
import { SendIcon, TrashIcon, SparkleIcon } from "../lib/icons";

type Turn = {
  role: "user" | "assistant";
  content: string;
  id?: number;
  trace?: ChatReply["trace"];
};

const STARTERS = [
  { section: "Snapshot", label: "What do you know about our brand so far?", prompt: "What do you know about our brand so far?" },
  { section: "Plan", label: "Plan me 7 days, Trail Hoodie drop, IG + FB.", prompt: "Plan me 7 days of content, focused on the Trail Hoodie drop, IG + FB." },
  { section: "Learn", label: "Which past posts performed best, and why?", prompt: "Which of our past posts performed best and why?" },
  { section: "Watch", label: "Study @onrunning on Instagram.", prompt: "Track @onrunning on Instagram and tell me what they're pushing." },
  { section: "Draft", label: "Sunday drop-hype post.", prompt: "Draft this Sunday's drop-hype post — remember our best posting time." },
];

export default function Chat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.agent.history().then((r: any) =>
      setTurns((r.turns || []).map((t: any) => ({ role: t.role, content: t.content, id: t.id })))
    ).catch(() => {});
    api.memory.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [turns.length, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setErr(null);
    setTurns((t) => [...t, { role: "user", content: text }]);
    setMsg("");
    setBusy(true);
    try {
      const r = (await api.agent.chat(text)) as ChatReply;
      setTurns((t) => [...t, { role: "assistant", content: r.reply, trace: r.trace }]);
      api.memory.stats().then(setStats).catch(() => {});
    } catch (e: any) {
      setErr(e.message || String(e));
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: "The desk is offline. If Groq or Hindsight aren't configured, head to Setup.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function wipe() {
    if (!confirm("Clear this conversation? Memory in Hindsight remains.")) return;
    await api.agent.wipe();
    setTurns([]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Chat"
        title={<>Your memory-first CMO, <span className="serif-italic text-brand-deep">on call.</span></>}
        kicker="Every turn is retained and cited by the next. Ask about strategy, request a plan, publish a post, or study a rival."
        right={
          <div className="flex items-center gap-2">
            <div className="pill">
              <span className="dot dot-green" />
              <span className="text-ink font-medium">{stats?.total_nodes ?? "—"}</span>
              <span className="text-muted">memories</span>
            </div>
            <button className="btn btn-sm" onClick={wipe}>
              <TrashIcon size={13} /> Clear
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 h-[calc(100vh-260px)] min-h-[540px]">
        {/* Chat pane */}
        <div className="card flex flex-col overflow-hidden reveal-3">
          <div className="px-5 py-3 border-b border-line flex items-center gap-2 bg-quiet/50">
            <span className="dot dot-green" />
            <span className="text-[12.5px] text-muted">The Correspondence</span>
            <span className="mono text-[11px] text-soft ml-auto">
              {turns.length} turns
            </span>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {turns.length === 0 && <EmptyState onPick={send} />}
            {turns.map((t, i) => (
              <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[82%]">
                  <div className={(t.role === "user" ? "bubble-user" : "bubble-agent") + " whitespace-pre-wrap"}>
                    {t.content}
                  </div>
                  {t.trace && t.trace.some((h) => h.tool_calls.length) && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                      {Array.from(new Set(t.trace.flatMap((h) => h.tool_calls).filter(Boolean))).map((name) => (
                        <span key={name} className="tag tag-brand mono">{name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 muted text-sm">
                <span className="dot dot-green animate-pulse" />
                <span>Thinking</span>
                <ThinkingDots />
              </div>
            )}
            {err && (
              <div className="text-danger text-sm border border-danger/40 bg-dangerSoft rounded-lg px-3 py-2">
                {err}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-line p-3 bg-canvas">
            <div className="flex items-end gap-2">
              <textarea
                className="textarea"
                placeholder="Ask, plan, publish, watch…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    send(msg);
                  }
                }}
              />
              <button className="btn btn-primary h-[44px] px-4" onClick={() => send(msg)} disabled={busy}>
                <SendIcon size={14} />
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-muted flex items-center gap-1">
              <span className="kbd">⌘</span>/<span className="kbd">Ctrl</span> +{" "}
              <span className="kbd">↵</span> to send
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 reveal-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 eyebrow">
              <SparkleIcon size={13} /> Warm starts
            </div>
            <div className="mt-3 space-y-1.5">
              {STARTERS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.prompt)}
                  className="w-full text-left border border-line rounded-lg p-3 hover:border-brand hover:bg-brand-fill transition"
                >
                  <div className="text-[11px] uppercase tracking-widest text-muted font-semibold">
                    {s.section}
                  </div>
                  <div className="mt-1 text-[13px] leading-snug text-ink">
                    {s.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card-quiet p-4">
            <div className="eyebrow"><span className="dot-lead" /> The Method</div>
            <p className="mt-3 text-[12.5px] text-muted leading-relaxed">
              Your message → <span className="font-semibold text-ink">Groq</span> chooses tools →{" "}
              <span className="font-semibold text-ink">Hindsight</span> supplies memory → answers cite it → <span className="font-semibold text-ink">Meta Graph</span> publishes on request. Every exchange retained.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="max-w-lg mx-auto py-8 reveal-2">
      <div className="brand-mark mb-5" style={{ width: 44, height: 44, fontSize: 22 }}>R</div>
      <div className="h1 leading-[1.02]" style={{ fontSize: 34 }}>
        Warm and ready.
      </div>
      <p className="text-muted mt-3 text-[14.5px] leading-relaxed">
        The desk already knows your brand voice, audience, five pillars, and six
        past-post learnings. Ask below, or pick from the right.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
        {[
          "What do you know about our brand?",
          "What kind of post gets the most saves?",
        ].map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-left border border-line rounded-lg p-3 hover:border-brand hover:bg-brand-fill transition text-[13px] font-medium"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1 h-1 rounded-full bg-brand animate-pulse" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 rounded-full bg-brand animate-pulse" style={{ animationDelay: "180ms" }} />
      <span className="w-1 h-1 rounded-full bg-brand animate-pulse" style={{ animationDelay: "360ms" }} />
    </span>
  );
}
