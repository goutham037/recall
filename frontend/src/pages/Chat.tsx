import { useEffect, useRef, useState } from "react";
import { api, ChatReply } from "../lib/api";
import { PageHead } from "../components/Shell";
import { SendIcon, TrashIcon } from "../lib/icons";

type Turn = {
  role: "user" | "assistant";
  content: string;
  id?: number;
  trace?: ChatReply["trace"];
};

const STARTERS: { section: string; label: string; prompt: string }[] = [
  {
    section: "Snapshot",
    label: "What do you know about our brand?",
    prompt: "What do you know about our brand so far?",
  },
  {
    section: "Plan",
    label: "Plan next week for the Trail Hoodie drop.",
    prompt: "Plan me 7 days of content, focused on the Trail Hoodie drop, IG + FB.",
  },
  {
    section: "Learn",
    label: "Which past posts performed best, and why?",
    prompt: "Which of our past posts performed best and why?",
  },
  {
    section: "Watch",
    label: "Study a rival: @onrunning.",
    prompt: "Track @onrunning on Instagram and tell me what they're pushing.",
  },
  {
    section: "Draft",
    label: "Sunday drop-hype post.",
    prompt: "Draft this Sunday's drop-hype post — remember our best posting time.",
  },
];

export default function Chat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.agent
      .history()
      .then((r: any) =>
        setTurns(
          (r.turns || []).map((t: any) => ({
            role: t.role,
            content: t.content,
            id: t.id,
          }))
        )
      )
      .catch(() => {});
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
      setTurns((t) => [
        ...t,
        { role: "assistant", content: r.reply, trace: r.trace },
      ]);
    } catch (e: any) {
      setErr(e.message || String(e));
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content:
            "The desk is offline. If Groq or Hindsight aren't configured, head to Setup.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function wipe() {
    if (!confirm("Clear this correspondence? Memory in Hindsight remains.")) return;
    await api.agent.wipe();
    setTurns([]);
  }

  return (
    <>
      <PageHead
        eyebrow="Section 01 · The Correspondence"
        title={
          <>
            A memory-first CMO,
            <br />
            <span className="serif-italic text-brand-deep">at your desk.</span>
          </>
        }
        kicker="Every message is retained to Hindsight and cited by the next one. Ask about strategy, request a plan, publish a post, or study a rival."
        right={
          <button className="btn btn-sm" onClick={wipe}>
            <TrashIcon size={13} /> Clear
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 min-h-[520px]">
        {/* Left column — the conversation */}
        <div className="reveal-3">
          <div className="divider mb-4">
            <span>The Conversation</span>
          </div>
          <div
            ref={listRef}
            className="space-y-5 overflow-y-auto pr-1"
            style={{ maxHeight: "calc(100vh - 380px)" }}
          >
            {turns.length === 0 && <EmptyEditorial onPick={send} />}
            {turns.map((t, i) => (
              <div
                key={i}
                className={
                  t.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div className="max-w-[85%]">
                  <div
                    className={
                      (t.role === "user" ? "bubble-user" : "bubble-agent") +
                      " whitespace-pre-wrap leading-[1.55] text-[14.5px]"
                    }
                  >
                    {t.role === "assistant" && <span className="quote-mark">“</span>}
                    {t.content}
                  </div>
                  {t.trace && t.trace.some((h) => h.tool_calls.length) && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                      {Array.from(
                        new Set(
                          t.trace.flatMap((h) => h.tool_calls).filter(Boolean)
                        )
                      ).map((name) => (
                        <span key={name} className="tag tag-good mono !text-[10px]">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 muted text-sm">
                <span className="dot dot-green animate-pulse" />
                <span className="serif-italic">The desk is thinking</span>
                <span className="mono text-xs">
                  recall · reflect · plan
                </span>
              </div>
            )}
            {err && (
              <div className="text-danger text-sm border border-danger/40 bg-dangerSoft px-3 py-2 rounded">
                {err}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="mt-6 border-t border-ink pt-4">
            <div className="field-label">Reply</div>
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
              <button
                className="btn btn-ink h-[44px] px-4"
                onClick={() => send(msg)}
                disabled={busy}
              >
                <SendIcon size={14} />
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] muted">
              <span className="kbd">⌘</span>/<span className="kbd">Ctrl</span>{" "}
              + <span className="kbd">↵</span> to send
            </div>
          </div>
        </div>

        {/* Right column — the sidebar (editorial "Departments") */}
        <aside className="reveal-4">
          <div className="divider mb-4">
            <span>Departments</span>
          </div>
          <div className="space-y-1">
            {STARTERS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                className="w-full text-left group border-t border-rule py-3 hover:bg-brand-fill transition-colors px-1"
                style={i === 0 ? { borderTop: "1px solid #14140F" } : {}}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="dateline">{s.section}</div>
                  <div className="mono text-[10px] muted">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-1 text-[14px] leading-snug text-ink group-hover:text-brand-deep transition-colors">
                  {s.label}
                </div>
              </button>
            ))}
            <div className="border-t border-ink" />
          </div>

          <div className="mt-8 card-quiet p-5">
            <div className="eyebrow no-rules mb-3">The Method</div>
            <p className="text-[13px] leading-relaxed muted">
              Every reply is planned by{" "}
              <span className="text-ink font-semibold">Groq</span>, grounded in{" "}
              <span className="text-ink font-semibold">Hindsight</span> memory,
              and executed against{" "}
              <span className="text-ink font-semibold">Meta Graph API</span>.
              Nothing forgotten. Nothing repeated.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function EmptyEditorial({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="border-t border-ink border-b py-8 my-2 dropcap">
      <span className="serif text-[15px] leading-relaxed text-pen">
        The desk keeps a running file on your brand — the voice you write in,
        the audience you speak to, the pillars you rotate, the posts that
        landed and the ones that didn't. Ask for a plan and it will cite the
        file. Ask <span className="serif-italic">why</span> and it will read
        from it aloud.
      </span>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
        {[
          "What do you know about our brand?",
          "What kind of post gets the most saves?",
        ].map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-left border border-rule hover:border-ink hover:bg-brand-fill transition-colors px-4 py-3"
          >
            <div className="text-[13.5px] leading-snug">{p}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
