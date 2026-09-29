import { useState, useEffect, useMemo } from "react";

export interface MemoryNode {
  id: string;
  code: string;
  label: string;
  category: "Pattern" | "Campaign" | "Post" | "Audience" | "Competitor" | "Learning" | "Fact";
  date: string;
  headline: string;
  metric?: string;
  takeaway: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  connections: string[]; // ids of connected nodes
  isCenterpiece?: boolean;
}

export const MEMORY_GRAPH_NODES: MemoryNode[] = [
  {
    id: "center-pattern",
    code: "SYN-01",
    label: "Story + Pain Solves Win",
    category: "Pattern",
    date: "Sep 28, 2026",
    headline: "Story-led reels consistently outperform static flyers",
    metric: "480 saves · 7.1x lift",
    takeaway: "High-urgency problem solving with authentic voice generates 7.1x higher bookmark saves than static price lists.",
    x: 50,
    y: 48,
    connections: ["m1", "m2", "m3", "m4", "m5", "m6"],
    isCenterpiece: true,
  },
  {
    id: "m1",
    code: "0248",
    label: "Emergency Dinner Reel",
    category: "Post",
    date: "Sep 28, 2026",
    headline: "15-minute emergency kitchen solve",
    metric: "480 saves · 34K reach",
    takeaway: "When dinner ingredients run out at 9:30 PM, quick-solve reels achieve peak viewer retention.",
    x: 32,
    y: 34,
    connections: ["center-pattern", "m2", "m4"],
  },
  {
    id: "m2",
    code: "0211",
    label: "Midnight Craving Carousel",
    category: "Campaign",
    date: "Sep 21, 2026",
    headline: "Late night apartment snack guide",
    metric: "390 saves · 22K reach",
    takeaway: "Carousels posted between 8:00 PM and 10:30 PM drove 3.4x higher bookmark rates from apartment dwellers.",
    x: 22,
    y: 56,
    connections: ["center-pattern", "m1", "m7"],
  },
  {
    id: "m3",
    code: "0185",
    label: "Static Price Flyer",
    category: "Learning",
    date: "Sep 15, 2026",
    headline: "Discount catalogue printout graphic",
    metric: "42 saves (retired format)",
    takeaway: "Pure catalogue price listings underperform dynamic narrative videos by 4x; audience ignores pure discounts.",
    x: 72,
    y: 28,
    connections: ["center-pattern", "m8"],
  },
  {
    id: "m4",
    code: "0142",
    label: "Apartment Dwellers",
    category: "Audience",
    date: "Sep 10, 2026",
    headline: "Peak response hours: 7:30 – 11:00 PM",
    metric: "12 signals captured",
    takeaway: "Urban professionals respond strongest to 'dinner rescue' and 'instant pantry restock' hooks after work.",
    x: 68,
    y: 62,
    connections: ["center-pattern", "m1", "m6"],
  },
  {
    id: "m5",
    code: "0098",
    label: "Rival Discount Watch",
    category: "Competitor",
    date: "Sep 04, 2026",
    headline: "Hyperlocal speed & price flyer analysis",
    metric: "14 dispatches tracked",
    takeaway: "Rivals prioritize humorous banter and 10-minute delivery; our highest lift comes from real recipe utility.",
    x: 78,
    y: 44,
    connections: ["center-pattern", "m3"],
  },
  {
    id: "m6",
    code: "0064",
    label: "Group-Chat Voice",
    category: "Fact",
    date: "Aug 29, 2026",
    headline: "Writing like teammates in group chat",
    metric: "2.5x comment reply rate",
    takeaway: "Informal, direct second-person copy drove 2.5x more active comment replies than formal supermarket ads.",
    x: 38,
    y: 72,
    connections: ["center-pattern", "m4", "m7"],
  },
  {
    id: "m7",
    code: "0052",
    label: "Sunday Meal Prep",
    category: "Campaign",
    date: "Aug 20, 2026",
    headline: "Sunday 6:00 PM drop content",
    metric: "310 saves · 18K reach",
    takeaway: "Sunday evening is the highest-intent window for planning weeknight groceries and meal rescues.",
    x: 18,
    y: 78,
    connections: ["m2", "m6"],
  },
  {
    id: "m8",
    code: "0031",
    label: "Pantry Staples Hook",
    category: "Learning",
    date: "Aug 12, 2026",
    headline: "3 Ingredients You Always Forget",
    metric: "295 saves · 19K reach",
    takeaway: "Reminding cooks about forgotten staple ingredients consistently triggers save-for-later behavior.",
    x: 84,
    y: 22,
    connections: ["m3", "m5"],
  },
];

export const SAMPLE_NODES = MEMORY_GRAPH_NODES;

interface MemoryConstellationProps {
  onSelectNode?: (node: MemoryNode) => void;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onHoverNode?: (id: string | null) => void;
  heightClass?: string;
  showCard?: boolean;
}

export function MemoryConstellation({
  onSelectNode,
  selectedNodeId,
  hoveredNodeId,
  onHoverNode,
  heightClass = "h-[460px] md:h-[540px]",
  showCard = true,
}: MemoryConstellationProps) {
  const [internalActive, setInternalActive] = useState<MemoryNode>(MEMORY_GRAPH_NODES[0]);
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  // Sync external selectedNodeId
  useEffect(() => {
    if (selectedNodeId) {
      const found = MEMORY_GRAPH_NODES.find((n) => n.id === selectedNodeId || n.code === selectedNodeId);
      if (found) setInternalActive(found);
    }
  }, [selectedNodeId]);

  const activeNode = useMemo(() => {
    if (selectedNodeId) {
      const found = MEMORY_GRAPH_NODES.find((n) => n.id === selectedNodeId || n.code === selectedNodeId);
      if (found) return found;
    }
    return internalActive;
  }, [selectedNodeId, internalActive]);

  const activeHoverId = hoveredNodeId !== undefined ? hoveredNodeId : internalHover;

  // Gentle, organic floating drift
  useEffect(() => {
    let animId: number;
    const start = Date.now();
    const tick = () => {
      setTime((Date.now() - start) * 0.0005);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Determine connected nodes to highlight
  const connectedNodeIds = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const set = new Set<string>(activeNode.connections);
    set.add(activeNode.id);
    return set;
  }, [activeNode]);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-[14px] border border-line bg-surface select-none overflow-hidden transition-all`}
    >
      {/* Editorial Watermark & Memory Health */}
      <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-[11px] font-mono tracking-widest uppercase text-muted font-semibold">
          HINDSIGHT MEMORY TOPOLOGY · LIVE
        </span>
      </div>

      <div className="absolute top-4 right-5 z-10 hidden sm:flex items-center gap-3 text-[11px] font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" /> 9 MOMENTS
        </span>
        <span>•</span>
        <span>14 RELATIONSHIPS</span>
      </div>

      {/* SVG Living Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {MEMORY_GRAPH_NODES.map((node) => {
          const n1x = node.x + Math.sin(time + parseInt(node.code.replace(/\D/g, "") || "1", 10)) * 0.7;
          const n1y = node.y + Math.cos(time + parseInt(node.code.replace(/\D/g, "") || "1", 10)) * 0.7;

          return node.connections.map((targetId) => {
            const target = MEMORY_GRAPH_NODES.find((n) => n.id === targetId);
            if (!target) return null;
            const n2x = target.x + Math.sin(time + parseInt(target.code.replace(/\D/g, "") || "2", 10)) * 0.7;
            const n2y = target.y + Math.cos(time + parseInt(target.code.replace(/\D/g, "") || "2", 10)) * 0.7;

            const isDirectlyConnected =
              activeNode && (activeNode.id === node.id || activeNode.id === target.id);
            const isHoverConnected =
              activeHoverId && (activeHoverId === node.id || activeHoverId === target.id);
            const isHighlighted = isDirectlyConnected || isHoverConnected;

            return (
              <line
                key={`${node.id}-${target.id}`}
                x1={`${n1x}%`}
                y1={`${n1y}%`}
                x2={`${n2x}%`}
                y2={`${n2y}%`}
                stroke={isHighlighted ? "#2F8F3A" : "#DFDED7"}
                strokeWidth={isHighlighted ? 1.75 : 1}
                strokeDasharray={isHighlighted ? "none" : "3,4"}
                opacity={isHighlighted ? 0.9 : 0.45}
                className="transition-all duration-300"
              />
            );
          });
        })}
      </svg>

      {/* Memory Nodes */}
      {MEMORY_GRAPH_NODES.map((node) => {
        const isActive = activeNode?.id === node.id;
        const isConnected = connectedNodeIds.has(node.id);
        const isHovered = activeHoverId === node.id;
        const codeNum = parseInt(node.code.replace(/\D/g, "") || "1", 10);
        const driftX = Math.sin(time + codeNum) * 3.5;
        const driftY = Math.cos(time + codeNum) * 3.5;

        // Visual distinction for synthesized centerpiece pattern vs regular memories
        const isCenter = node.isCenterpiece;

        return (
          <div
            key={node.id}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px)`,
            }}
            onClick={() => {
              setInternalActive(node);
              onSelectNode?.(node);
            }}
            onMouseEnter={() => {
              setInternalHover(node.id);
              onHoverNode?.(node.id);
            }}
            onMouseLeave={() => {
              setInternalHover(null);
              onHoverNode?.(null);
            }}
            className={`absolute cursor-pointer group flex flex-col items-center z-20 transition-opacity duration-300 ${
              activeHoverId && !isHovered && !connectedNodeIds.has(node.id) ? "opacity-40" : "opacity-100"
            }`}
          >
            {/* Outer halo ring */}
            <div
              className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                isCenter
                  ? isActive
                    ? "w-11 h-11 bg-brand-soft ring-2 ring-brand scale-110 shadow-sm"
                    : "w-9 h-9 bg-brand-soft/70 ring-1.5 ring-brand/60 hover:scale-105"
                  : isActive
                  ? "w-8 h-8 bg-brand-soft ring-2 ring-brand scale-120 shadow-sm"
                  : isConnected
                  ? "w-7 h-7 bg-surface ring-1 ring-brand/40 group-hover:ring-brand"
                  : "w-6 h-6 bg-surface ring-1 ring-line group-hover:ring-brand/40"
              }`}
            >
              {/* Core dot */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  isCenter
                    ? "w-4 h-4 bg-brand-deep shadow-xs"
                    : isActive
                    ? "w-3 h-3 bg-brand scale-110"
                    : isConnected
                    ? "w-2.5 h-2.5 bg-brand-deep/80 group-hover:bg-brand"
                    : "w-2 h-2 bg-ink/60 group-hover:bg-brand"
                }`}
              />
            </div>

            {/* Label below node */}
            <div
              className={`mt-1.5 px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-all duration-200 pointer-events-none ${
                isCenter
                  ? "bg-brand-deep text-white font-semibold shadow-xs"
                  : isActive
                  ? "bg-ink text-white font-medium shadow-xs"
                  : "text-ink font-medium bg-surface/90 backdrop-blur-xs border border-line/70 group-hover:border-brand/40"
              }`}
            >
              {isCenter ? `★ ${node.label}` : node.label}
            </div>
          </div>
        );
      })}

      {/* Floating Memory Inspection Card */}
      {showCard && activeNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[380px] p-5 bg-white/95 backdrop-blur-md border border-line rounded-[12px] shadow-sm z-30 transition-all duration-300">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-2">
            <span className="text-brand-deep font-bold tracking-wider">
              {activeNode.isCenterpiece ? "SYNTHESIZED PATTERN" : `MEMORY // ${activeNode.code}`}
            </span>
            <span className="bg-surface-subtle border border-line px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
              {activeNode.category}
            </span>
          </div>

          <div className="serif text-[18px] font-medium leading-snug text-ink">
            {activeNode.headline}
          </div>

          {activeNode.metric && (
            <div className="mt-2 text-[12px] font-mono text-brand-deep font-semibold">
              ● {activeNode.metric}
            </div>
          )}

          <p className="mt-2.5 text-[12.5px] text-pen leading-relaxed border-t border-line/60 pt-2.5">
            "{activeNode.takeaway}"
          </p>

          <div className="mt-3 pt-2.5 border-t border-line/40 flex items-center justify-between text-[11px] font-mono text-muted">
            <span>Captured {activeNode.date}</span>
            <button
              onClick={() => onSelectNode?.(activeNode)}
              className="text-brand-deep font-semibold hover:underline"
            >
              Inspect evidence →
            </button>
          </div>
        </div>
      )}

      {/* Subtle Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 hidden lg:flex items-center gap-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-md border border-line text-[11px] font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-deep" /> Pattern
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand" /> Post / Campaign
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ink/70" /> Audience / Competitor
        </span>
      </div>
    </div>
  );
}
