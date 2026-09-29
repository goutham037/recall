import { useState } from "react";
import { Link } from "react-router-dom";
import { SparkleIcon } from "../lib/icons";

export function HeroDemo() {
  const [step, setStep] = useState<"idle" | "recalling" | "pattern" | "resolved">("idle");
  const [showEvidence, setShowEvidence] = useState(false);

  function trigger() {
    if (step === "recalling" || step === "pattern") return;
    setStep("recalling");
    setShowEvidence(false);

    setTimeout(() => {
      setStep("pattern");
    }, 1100);

    setTimeout(() => {
      setStep("resolved");
    }, 2200);
  }

  function reset() {
    setStep("idle");
    setShowEvidence(false);
  }

  return (
    <div className="w-full rounded-xl border border-line bg-surface p-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-line text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="font-semibold text-ink uppercase tracking-wider">RECALL BENCHMARK · INTERACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          {step === "resolved" && (
            <button
              onClick={reset}
              className="text-muted hover:text-ink text-[11px] underline transition-colors"
            >
              Reset test
            </button>
          )}
          <span className="text-soft">PROMPT 01</span>
        </div>
      </div>

      {/* Interactive Trigger Query */}
      <div className="my-5 p-4 bg-quiet/60 border border-line rounded-lg flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10.5px] uppercase font-mono tracking-wider text-muted font-semibold">
            Inquiry to CMO
          </div>
          <div className="text-[16px] text-ink font-serif mt-0.5">
            "What kind of post gets the most saves?"
          </div>
        </div>

        <button
          onClick={trigger}
          disabled={step === "recalling" || step === "pattern"}
          className={`btn btn-sm ${
            step === "idle" ? "btn-primary" : "btn-ink"
          } transition-all`}
        >
          {step === "idle" ? (
            <>
              <SparkleIcon size={12} />
              Run Memory Recall →
            </>
          ) : step === "recalling" ? (
            "Searching Hindsight…"
          ) : step === "pattern" ? (
            "Synthesizing…"
          ) : (
            "Run Again"
          )}
        </button>
      </div>

      {/* Recalling Sequence Animation */}
      {step === "recalling" && (
        <div className="py-6 px-4 bg-brand-fill/50 border border-brand/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 text-[11px] font-mono text-brand-deep font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            RECALLING MEMORIES ACROSS 4 CAMPAIGNS…
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono text-muted">
            <div className="p-2 bg-surface rounded border border-line">
              <span className="text-brand font-semibold">● 12</span> past memories
            </div>
            <div className="p-2 bg-surface rounded border border-line">
              <span className="text-brand font-semibold">● 4</span> launch drops
            </div>
            <div className="p-2 bg-surface rounded border border-line">
              <span className="text-brand font-semibold">● 3</span> performance signals
            </div>
          </div>
        </div>
      )}

      {/* Pattern Found Banner */}
      {step === "pattern" && (
        <div className="py-5 px-4 bg-brand-soft/70 border border-brand/40 rounded-lg">
          <div className="flex items-center gap-2 text-[12px] font-mono text-brand-deep font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand" />
            PATTERN IDENTIFIED FROM HISTORICAL EVIDENCE
          </div>
          <p className="mt-1 text-[13px] text-pen font-serif">
            Isolating outlier engagement patterns from August & September saves data…
          </p>
        </div>
      )}

      {/* Resolved State — The Grounded Answer */}
      {step === "resolved" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface border border-line rounded-lg shadow-sm">
            <div className="text-[11px] font-mono text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Agent Decision Grounded in Memory</span>
              <span className="text-brand font-medium">98.4% grounded</span>
            </div>

            <div className="serif text-[18px] text-ink leading-snug">
              Story-driven reels solving urgent everyday problems are the clear winner for saves.
            </div>

            <p className="mt-2 text-[13px] text-muted leading-relaxed">
              Our 15-minute kitchen emergency reels hit <span className="font-semibold text-ink">480 saves at 34K reach</span> (7.2% engagement), while static discount flyers produced only 42 saves.
            </p>

            {/* Evidence Drawer Toggle */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between flex-wrap gap-2 text-[12px]">
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="text-brand-deep hover:underline font-mono text-[11px] font-semibold flex items-center gap-1.5"
              >
                {showEvidence ? "− Hide Memory Lineage" : "+ Why this recommendation? (Inspect 3 memories)"}
              </button>

              <Link
                to="/app/studio"
                className="btn btn-primary btn-sm text-[12px]"
              >
                Create from this insight →
              </Link>
            </div>

            {/* Lineage Breakdown */}
            {showEvidence && (
              <div className="mt-3 pt-3 border-t border-line/60 space-y-2 text-[11.5px] font-mono">
                <div className="p-2.5 bg-quiet/80 rounded border border-line text-pen">
                  <span className="text-brand-deep font-semibold">MEMORY #0248</span> — Reel "Dinner at 9:30 PM delivered in 15 mins" scored 480 saves.
                </div>
                <div className="p-2.5 bg-quiet/80 rounded border border-line text-pen">
                  <span className="text-brand-deep font-semibold">MEMORY #0211</span> — Late-night snack carousel scored 390 saves; 3.4x higher bookmark rate.
                </div>
                <div className="p-2.5 bg-quiet/80 rounded border border-line text-pen">
                  <span className="text-muted font-semibold">LEARNING #0185</span> — Static flyer underperformed video reels by 4x on saves.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idle Prompt Preview */}
      {step === "idle" && (
        <div className="py-6 text-center border border-dashed border-line rounded-lg bg-quiet/30">
          <p className="text-[13px] text-muted">
            Click <strong className="text-ink">Run Memory Recall</strong> above to witness how RECALL searches past moments, identifies patterns, and grounds its answer in evidence.
          </p>
        </div>
      )}
    </div>
  );
}
