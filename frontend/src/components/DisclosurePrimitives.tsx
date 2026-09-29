import React, { useState } from "react";

/**
 * 01. Understated Tabs
 * Follows Rule 72: Active = dark text with subtle green underline; Inactive = muted text.
 */
export function UnderstatedTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-6 border-b border-line mb-8 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-[13.5px] font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? "text-ink font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-brand-soft text-brand-deep font-semibold"
                    : "bg-surface-subtle text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full transition-all" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 02. Evidence Drawer
 * Follows Rule 87: 300-400ms smooth slide-over from right, dimmed backdrop, rich layers.
 */
export function EvidenceDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel p-6 sm:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line gap-4">
          <div>
            {badge && (
              <div className="text-[10.5px] uppercase font-mono tracking-wider text-brand-deep font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand" />
                {badge}
              </div>
            )}
            <h3 className="serif text-[22px] font-medium text-ink leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12.5px] text-muted mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink hover:bg-quiet transition-colors text-sm shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="py-6 space-y-6 flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-line flex items-center justify-between text-xs text-muted">
          <span className="font-mono text-[11px]">RECALL Hindsight Engine</span>
          <button onClick={onClose} className="btn btn-sm btn-ink">
            Done reading
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * 03. Technical Details (Collapsible)
 * Follows Rule 38 & 61: Hidden by default, clean mono presentation for evaluators/judges.
 */
export function TechnicalDetails({
  label = "Technical details",
  defaultOpen = false,
  data,
  children,
}: {
  label?: string;
  defaultOpen?: boolean;
  data?: any;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-line/80 rounded-lg overflow-hidden bg-quiet/30 my-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center justify-between text-left text-[11.5px] font-mono text-muted hover:text-ink hover:bg-quiet/60 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-brand-deep font-bold">{open ? "▾" : "▸"}</span>
          <span>{label}</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted/70">
          {open ? "Hide" : "Inspect"}
        </span>
      </button>

      {open && (
        <div className="p-4 border-t border-line bg-surface text-[12px] font-mono space-y-2">
          {data && (
            <pre className="p-3 bg-quiet/70 rounded text-[11px] text-ink overflow-x-auto leading-relaxed border border-line">
              {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
            </pre>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * 04. Details Disclosure (Inline lightweight)
 * Follows Rule 06: Understated toggle for secondary rationale.
 */
export function DetailsDisclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-[12px] text-brand-deep font-semibold hover:underline inline-flex items-center gap-1"
      >
        <span>{title}</span>
        <span className="text-[10px] font-mono">{open ? "↑" : "→"}</span>
      </button>

      {open && (
        <div className="p-3.5 bg-surface-subtle border border-line rounded-md text-[13px] text-pen leading-relaxed reveal">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * 05. Show More / Truncate
 * Follows Rule 47: Avoids paragraph clutter on cards while preserving long text.
 */
export function ShowMore({
  text,
  maxLength = 140,
}: {
  text: string;
  maxLength?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text || text.length <= maxLength) {
    return <span className="text-pen">{text}</span>;
  }

  return (
    <span className="text-pen">
      {expanded ? text : text.slice(0, maxLength) + "… "}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-brand-deep font-semibold text-[11.5px] hover:underline ml-1"
      >
        {expanded ? "Show less ↑" : "Show more ↓"}
      </button>
    </span>
  );
}

/**
 * 06. Action Menu ([•••])
 * Follows Rule 88: Contextual dropdown for secondary actions to clean up button noise.
 */
export function ActionMenu({
  items,
}: {
  items: { label: string; onClick: () => void; danger?: boolean; icon?: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-8 h-8 rounded-md border border-line flex items-center justify-center text-muted hover:text-ink hover:bg-quiet transition-colors text-[13px]"
        title="More actions"
      >
        •••
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 mt-1 w-44 card p-1.5 shadow-pop z-40 space-y-0.5">
            {items.map((it, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  it.onClick();
                }}
                className={`w-full text-left px-3 py-1.5 text-[12.5px] rounded transition-colors flex items-center justify-between ${
                  it.danger
                    ? "text-red-700 hover:bg-red-50"
                    : "text-ink hover:bg-quiet"
                }`}
              >
                <span>{it.label}</span>
                {it.icon && <span className="text-muted text-[11px]">{it.icon}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
