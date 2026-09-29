import React from "react";

export interface MemoryDetail {
  id: string;
  code: string;
  title: string;
  category: string;
  capturedAt: string;
  performance?: string;
  pattern: string;
  recalledIn: string[];
  content: string;
  relatedMemories?: { id: string; code: string; label: string }[];
}

export function MemoryDrawer({
  memory,
  onClose,
  onSelectRelated,
}: {
  memory: MemoryDetail | null;
  onClose: () => void;
  onSelectRelated?: (id: string) => void;
}) {
  if (!memory) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Slide-in Panel */}
      <div className="drawer-panel p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-brand-deep uppercase">
              MEMORY / {memory.code}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink hover:bg-quiet transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-muted">
              {memory.category} · Captured {memory.capturedAt}
            </div>
            <h2 className="serif text-[24px] font-medium text-ink mt-1 leading-snug">
              {memory.title}
            </h2>
          </div>

          {/* Raw Text */}
          <div className="p-4 bg-quiet/60 rounded-lg border border-line text-[13px] text-pen leading-relaxed font-sans">
            "{memory.content}"
          </div>

          {/* Performance Box */}
          {memory.performance && (
            <div className="p-3.5 bg-brand-fill/80 border border-brand/30 rounded-lg">
              <div className="text-[10.5px] uppercase font-mono tracking-widest text-brand-deep font-semibold">
                Recorded Performance
              </div>
              <div className="serif text-[18px] text-ink font-semibold mt-0.5">
                {memory.performance}
              </div>
            </div>
          )}

          {/* Pattern Identified */}
          <div>
            <div className="text-[11px] uppercase tracking-widest font-mono text-muted font-semibold mb-2">
              Observed Pattern
            </div>
            <div className="evidence-block">
              {memory.pattern}
            </div>
          </div>

          {/* Recalled In Lineage */}
          <div>
            <div className="text-[11px] uppercase tracking-widest font-mono text-muted font-semibold mb-2">
              Recalled In Decisions ({memory.recalledIn.length})
            </div>
            <div className="space-y-1.5">
              {memory.recalledIn.map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-surface border border-line rounded flex items-center gap-2 text-[12.5px] text-ink"
                >
                  <span className="text-brand font-mono text-[11px]">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Memories */}
          {memory.relatedMemories && memory.relatedMemories.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-widest font-mono text-muted font-semibold mb-2">
                Related Memories in Graph
              </div>
              <div className="grid grid-cols-1 gap-2">
                {memory.relatedMemories.map((rm) => (
                  <button
                    key={rm.id}
                    onClick={() => onSelectRelated?.(rm.id)}
                    className="p-2.5 bg-quiet/40 hover:bg-brand-fill/50 border border-line hover:border-brand/50 rounded flex items-center justify-between text-left transition-colors"
                  >
                    <span className="text-[12.5px] text-ink">{rm.label}</span>
                    <span className="font-mono text-[10.5px] text-muted">
                      #{rm.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-line flex items-center justify-between text-xs">
          <span className="text-muted font-mono text-[11px]">Vectorize Hindsight v1</span>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ink"
          >
            Done reading
          </button>
        </div>
      </div>
    </>
  );
}
