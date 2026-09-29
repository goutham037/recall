import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { MemoryConstellation, MemoryNode, MEMORY_GRAPH_NODES } from "../components/MemoryConstellation";
import { HeroDemo } from "../components/HeroDemo";
import { HeroVideoPlayer } from "../components/HeroVideoPlayer";
import { MemoryDrawer, MemoryDetail } from "../components/MemoryDrawer";

export default function Landing() {
  const { session } = useAuth();
  const primary = session ? "/app/chat" : "/signup";

  const [activeArch, setActiveArch] = useState<"memory" | "reasoning" | "action">("memory");
  const [selectedMemory, setSelectedMemory] = useState<MemoryDetail | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  function handleSelectNode(node: MemoryNode) {
    setSelectedMemory({
      id: node.id,
      code: node.code,
      title: node.headline,
      category: node.category,
      capturedAt: node.date,
      performance: node.metric,
      pattern: node.takeaway,
      recalledIn: ["Weekly Launch Strategy", "October Content Calendar", "CMO Save-Rate Synthesis"],
      content: `Recorded post outcome: "${node.headline}". Observed save and engagement lift. Stored with persistent Vectorize Hindsight tags.`,
      relatedMemories: node.connections.map((cid) => {
        const match = MEMORY_GRAPH_NODES.find((m) => m.id === cid);
        return {
          id: cid,
          code: match ? match.code : cid,
          label: match ? match.label : `Related Node ${cid}`,
        };
      }),
    });
  }

  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-brand-soft selection:text-brand-deep">
      {/* Top Bar */}
      <header className="border-b border-line bg-canvas/90 backdrop-blur sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group py-1" title="RECALL — An AI agent that remembers">
              <img
                src="/Recall_Logo.png"
                alt="RECALL Logo"
                className="h-14 sm:h-[60px] w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted font-medium">
            <a href="#hero-video" className="hover:text-ink transition-colors">
              Product Demo
            </a>
            <a href="#benchmark" className="hover:text-ink transition-colors">
              Live Demo
            </a>
            <a href="#problem" className="hover:text-ink transition-colors">
              The Amnesia Problem
            </a>
            <a href="#before-after" className="hover:text-ink transition-colors">
              Before / After
            </a>
            <a href="#chain" className="hover:text-ink transition-colors">
              Memory Chain
            </a>
            <a href="#architecture" className="hover:text-ink transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/signin" className="btn btn-ghost btn-sm text-[12.5px]">
              Sign in
            </Link>
            <Link to={primary} className="btn btn-primary btn-sm text-[12.5px]">
              {session ? "Enter workspace →" : "Enter RECALL →"}
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 2: HERO WITH 2-COLUMN BALANCED COMPOSITION */}
      <section id="hero-video" className="relative pt-12 pb-16 md:pt-16 md:pb-24 border-b border-line">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div className="eyebrow eyebrow-brand">
                <span className="dot-lead" /> A MEMORY-FIRST MARKETING INTELLIGENCE WORKSPACE
              </div>

              <h1 className="h1 text-[44px] sm:text-[56px] lg:text-[68px] leading-[0.98] font-normal tracking-tight">
                An AI agent that{" "}
                <span className="serif-italic text-brand-deep">remembers.</span>
              </h1>

              <p className="text-[17px] md:text-[19px] leading-[1.6] text-muted font-sans">
                It doesn't start from zero every time you ask a question.
                <br />
                <strong className="text-ink font-semibold">RECALL</strong> turns your brand's history into context for every decision.
              </p>

              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <Link to={primary} className="btn btn-primary btn-lg text-[14px]">
                  Enter RECALL →
                </Link>
                <a href="#benchmark" className="btn btn-lg text-[14px]">
                  Watch memory in action ↓
                </a>
              </div>

              <div className="pt-4 border-t border-line/60 flex items-center gap-4 text-[11px] font-mono text-muted flex-wrap">
                <span>● HINDSIGHT MEMORY</span>
                <span>● PERSISTENT CONTEXT</span>
                <span>● GROQ REASONING</span>
              </div>
            </div>

            {/* Right Column (7 Cols) — Live Product Demo Video */}
            <div className="lg:col-span-7 relative">
              <HeroVideoPlayer />
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 11: HERO DEMO MICRO-INTERACTION */}
      <section id="benchmark" className="py-20 border-b border-line bg-surface">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="eyebrow eyebrow-brand">
              <span className="dot-lead" /> SIGNATURE INTERACTION
            </div>
            <h2 className="serif text-[34px] md:text-[44px] text-ink font-normal mt-2 leading-tight">
              Watch the agent remember.
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed">
              Witness the exact cycle: question → recall → evidence → decision.
            </p>
          </div>

          <HeroDemo />
        </div>
      </section>

      {/* SECTION 12: THE AMNESIA PROBLEM */}
      <section id="problem" className="py-20 border-b border-line bg-[#FAF9F5]">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="eyebrow">
              <span className="dot-lead" /> The Critical Flaw in Modern AI
            </div>
            <h2 className="serif text-[36px] md:text-[46px] text-ink font-normal mt-2 leading-tight">
              Most AI agents forget what happened yesterday.
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed max-w-2xl mx-auto">
              Every chat session begins with a blank slate. You are forced to re-explain your audience, re-upload past posts, and re-teach what worked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without Memory */}
            <div className="notebook-panel p-8 border-l-4 border-l-red-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
                    WITHOUT MEMORY
                  </span>
                  <span className="mono text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded font-semibold">
                    AMNESIC CYCLE
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-3.5 bg-surface-subtle border border-line rounded">
                    <span className="mono text-[11px] text-muted block mb-1">Monday</span>
                    <span className="text-[13.5px] text-ink">"Our 15-minute emergency dinner reels performed extraordinarily well."</span>
                  </div>
                  <div className="p-3.5 bg-surface-subtle border border-line rounded">
                    <span className="mono text-[11px] text-muted block mb-1">Tuesday</span>
                    <span className="text-[13.5px] text-ink">"What format should we publish next week?"</span>
                  </div>
                  <div className="p-4 bg-red-50/70 border border-red-200/60 rounded">
                    <span className="mono text-[11px] text-red-800 font-bold block mb-1">Agent Response:</span>
                    <span className="text-[13.5px] text-red-900 leading-relaxed">
                      "I don't have access to your previous metrics. You could try educational carousels, blog posts, or static images."
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line text-[12px] text-muted mono">
                Result: Generic, ungrounded advice that repeats past mistakes.
              </div>
            </div>

            {/* With RECALL */}
            <div className="notebook-panel p-8 border-l-4 border-l-brand flex flex-col justify-between bg-white shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="mono text-[11px] uppercase tracking-wider text-brand-deep font-bold">
                    WITH RECALL
                  </span>
                  <span className="mono text-[10px] text-brand-deep bg-brand-soft px-2 py-0.5 rounded font-semibold">
                    PERSISTENT CONTEXT
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-3.5 bg-brand-soft/40 border border-brand/20 rounded">
                    <span className="mono text-[11px] text-brand-deep font-bold block mb-1">Monday · Memory Captured</span>
                    <span className="text-[13.5px] text-ink">"Filed in Hindsight bank: Reel hit 480 saves (7.1x lift)."</span>
                  </div>
                  <div className="p-3.5 bg-surface-subtle border border-line rounded">
                    <span className="mono text-[11px] text-muted block mb-1">Tuesday · Question Asked</span>
                    <span className="text-[13.5px] text-ink">"What format should we publish next week?"</span>
                  </div>
                  <div className="p-4 bg-brand-soft border border-brand/40 rounded">
                    <span className="mono text-[11px] text-brand-deep font-bold block mb-1">Recall Response:</span>
                    <span className="text-[13.5px] text-ink leading-relaxed font-sans">
                      "Your story-led reels consistently generated 7.1x more saves than static product posts. I recommend building the next campaign around that exact pattern."
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line text-[12px] text-brand-deep font-semibold mono">
                Result: Every decision is compoundingly smarter than the last.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13: BEFORE / AFTER PROOF */}
      <section id="before-after" className="py-20 border-b border-line">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="eyebrow eyebrow-brand">
              <span className="dot-lead" /> The Proof of Memory
            </div>
            <h2 className="serif text-[36px] md:text-[46px] text-ink font-normal mt-2 leading-tight">
              Watch the agent learn.
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed max-w-2xl mx-auto">
              When an AI agent retains historical post metrics and audience behavior, recommendations evolve from generic guesswork into high-conviction brand strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before Memory */}
            <div className="notebook-panel p-8 bg-surface-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="mono text-[11px] uppercase tracking-wider text-muted font-bold">
                  BEFORE MEMORY (GENERIC AI)
                </span>
                <span className="mono text-[11px] text-muted">0 context</span>
              </div>
              <div className="text-[13px] text-muted">User prompt:</div>
              <p className="text-[15px] text-ink font-medium">"What should we publish next week?"</p>
              
              <div className="p-4 bg-white border border-line rounded space-y-2">
                <span className="mono text-[10px] text-muted uppercase font-bold">Generic Agent:</span>
                <p className="text-[13.5px] text-muted leading-relaxed">
                  "Consider publishing a mix of content! You could try educational carousels about your products, behind-the-scenes stories, motivational quotes, or customer testimonials. Consistency is key!"
                </p>
              </div>
              <div className="text-[12px] text-muted italic">
                No recollection of which formats failed or succeeded for this specific brand.
              </div>
            </div>

            {/* After Memory */}
            <div className="notebook-panel p-8 bg-white border-2 border-brand/50 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="mono text-[11px] uppercase tracking-wider text-brand-deep font-bold">
                  AFTER MEMORY (RECALL ACTIVE)
                </span>
                <span className="mono text-[11px] text-brand-deep font-semibold bg-brand-soft px-2 py-0.5 rounded">
                  34 memories cross-referenced
                </span>
              </div>
              <div className="text-[13px] text-muted">User prompt:</div>
              <p className="text-[15px] text-ink font-medium">"What should we publish next week?"</p>

              <div className="p-4 bg-brand-soft border border-brand/40 rounded space-y-2">
                <span className="mono text-[10px] text-brand-deep uppercase font-bold">RECALL Agent:</span>
                <p className="text-[14px] text-ink leading-relaxed font-sans">
                  "Your story-led reels solving urgent weeknight dinners generated <strong className="text-brand-deep font-semibold">480 saves (7.1x higher than static flyers)</strong>. In contrast, catalogue carousels suffered high drop-off at slide 3.
                  <br /><br />
                  I recommend scheduling a 15-minute emergency dinner reel for Sunday 6:30 PM to catch peak meal-prep intent."
                </p>
              </div>

              {/* Evidence Bar */}
              <div className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="mono text-[11px] text-muted flex items-center gap-3">
                  <span>● 4 previous campaigns</span>
                  <span>● 12 audience signals</span>
                  <span>● 3 content patterns</span>
                </div>
                <button
                  onClick={() => setShowEvidence(!showEvidence)}
                  className="mono text-[11px] text-brand-deep font-bold hover:underline self-start sm:self-auto"
                >
                  {showEvidence ? "Hide evidence ↑" : "Why this recommendation? ↓"}
                </button>
              </div>

              {/* Expandable Evidence Lineage */}
              {showEvidence && (
                <div className="p-4 bg-surface-subtle border border-line rounded space-y-2 reveal">
                  <div className="mono text-[10px] uppercase text-muted font-bold">
                    SUPPORTING HINDSIGHT LINEAGE
                  </div>
                  <ul className="text-[12.5px] text-pen space-y-1.5 font-sans">
                    <li className="flex items-start gap-2">
                      <span className="mono text-brand-deep font-bold">#0248</span>
                      <span>Story-led Reel (Sep 28): 480 saves, 34K reach. Verified top performer.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mono text-brand-deep font-bold">#0185</span>
                      <span>Static Price Flyer (Sep 15): 42 saves. Confirmed underperformer; retired.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mono text-brand-deep font-bold">#0142</span>
                      <span>Audience Signal: Peak response hours 7:30 PM – 11:00 PM for apartment cooks.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 14: MEMORY CHAIN (HORIZONTAL PROGRESSION) */}
      <section id="chain" className="py-20 border-b border-line bg-[#FAF9F5]">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="eyebrow eyebrow-brand">
              <span className="dot-lead" /> The Continuous Cycle
            </div>
            <h2 className="serif text-[36px] md:text-[44px] text-ink font-normal mt-2 leading-tight">
              Memory is not a database.
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed">
              It is context carried forward. Every post outcome loops back into durable memory to sharpen future marketing decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: "01", name: "CAMPAIGN", sub: "What happened", desc: "You publish a story-led reel on Sunday evening." },
              { step: "02", name: "OBSERVATION", sub: "What we noticed", desc: "Post generates 480 saves and 7.1x higher bookmark lift." },
              { step: "03", name: "MEMORY", sub: "What we kept", desc: "Hindsight retains pattern under tag learning:high-performer." },
              { step: "04", name: "RECALL", sub: "What we retrieved", desc: "During next prompt, the agent recalls the 480 saves pattern." },
              { step: "05", name: "DECISION", sub: "What we chose", desc: "Agent prescribes another urgent dinner solve over static flyers." },
              { step: "06", name: "NEW ACTION", sub: "What we did", desc: "Studio drafts grounded reel; new memory is logged." },
            ].map((node) => (
              <div key={node.step} className="notebook-panel p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="mono text-[10px] text-muted tracking-widest uppercase font-bold">
                    STEP {node.step}
                  </div>
                  <div className="serif text-[18px] text-ink font-medium mt-1">
                    {node.name}
                  </div>
                  <div className="mono text-[10px] text-brand-deep font-semibold mt-0.5">
                    {node.sub}
                  </div>
                  <p className="text-[12px] text-muted mt-3 leading-relaxed">
                    {node.desc}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-line/60 text-right mono text-[12px] text-brand-deep">
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 15: INTERACTIVE ARCHITECTURE */}
      <section id="architecture" className="py-20 border-b border-line bg-surface">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <div className="eyebrow">
              <span className="dot-lead" /> Complete System Flow
            </div>
            <h2 className="serif text-[36px] md:text-[46px] text-ink font-normal mt-2 leading-tight">
              Interactive System Architecture
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed">
              Three coordinated layers turn durable past memories into live social execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Layer 1: Memory */}
            <div
              onClick={() => setActiveArch("memory")}
              className={`notebook-panel p-6 cursor-pointer transition-all ${
                activeArch === "memory"
                  ? "border-2 border-brand bg-brand-soft/40 shadow-xs"
                  : "bg-white hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mono text-muted mb-2">
                <span className="font-bold uppercase tracking-wider text-brand-deep">LAYER 01</span>
                <span>VECTOR MEMORY</span>
              </div>
              <h3 className="serif text-[24px] text-ink font-medium">Hindsight Memory Layer</h3>
              <p className="text-[13px] text-muted mt-2 leading-relaxed">
                Retains every fact, post engagement metric, and competitor dispatch into durable semantic memory graph.
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 text-[11.5px] mono text-brand-deep font-semibold">
                ● 34 Nodes · 193 Links Active
              </div>
            </div>

            {/* Layer 2: Reasoning */}
            <div
              onClick={() => setActiveArch("reasoning")}
              className={`notebook-panel p-6 cursor-pointer transition-all ${
                activeArch === "reasoning"
                  ? "border-2 border-brand bg-brand-soft/40 shadow-xs"
                  : "bg-white hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mono text-muted mb-2">
                <span className="font-bold uppercase tracking-wider text-brand-deep">LAYER 02</span>
                <span>INFERENCE & TOOLS</span>
              </div>
              <h3 className="serif text-[24px] text-ink font-medium">Groq Reasoning Engine</h3>
              <p className="text-[13px] text-muted mt-2 leading-relaxed">
                Synthesizes retrieved memories, executes autonomous planning tools, and grounds creative variants without hallucination.
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 text-[11.5px] mono text-brand-deep font-semibold">
                ● Llama-3.3-70B · Tool-Calling Native
              </div>
            </div>

            {/* Layer 3: Action */}
            <div
              onClick={() => setActiveArch("action")}
              className={`notebook-panel p-6 cursor-pointer transition-all ${
                activeArch === "action"
                  ? "border-2 border-brand bg-brand-soft/40 shadow-xs"
                  : "bg-white hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mono text-muted mb-2">
                <span className="font-bold uppercase tracking-wider text-brand-deep">LAYER 03</span>
                <span>DISPATCH & METRICS</span>
              </div>
              <h3 className="serif text-[24px] text-ink font-medium">Meta Publishing Mesh</h3>
              <p className="text-[13px] text-muted mt-2 leading-relaxed">
                Schedules reels and carousels directly to Instagram and Facebook, feeding engagement results back into Hindsight.
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 text-[11.5px] mono text-brand-deep font-semibold">
                ● Graph API · Continuous Telemetry
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 47 / 84: FINAL CALL TO ACTION */}
      <section className="py-24 border-b border-line bg-canvas text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <div className="eyebrow eyebrow-brand mb-4">
            <span className="dot-lead" /> START WITH CONTEXT
          </div>
          <h2 className="serif text-[44px] md:text-[56px] text-ink font-normal leading-[1.02] tracking-tight">
            See what it remembers.
          </h2>
          <p className="text-[18px] text-muted mt-4 max-w-lg mx-auto leading-relaxed">
            Ask a question. Watch memory change the answer.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to={primary} className="btn btn-primary btn-lg text-[14.5px]">
              ENTER RECALL →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-canvas">
        <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-muted">
          <div className="flex items-center gap-3">
            <span className="serif text-[20px] font-semibold text-ink">
              R<span className="text-brand">.</span>
            </span>
            <span>RECALL · Memory-first marketing intelligence workspace</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero-video" className="hover:text-ink">Product Demo</a>
            <a href="#benchmark" className="hover:text-ink">Live Demo</a>
            <a href="#architecture" className="hover:text-ink">Architecture</a>
            <Link to={primary} className="text-brand-deep font-semibold hover:underline">Workspace</Link>
          </div>

          <div className="mono text-[11px] text-soft">
            Vectorize Hindsight × Groq × Meta
          </div>
        </div>
      </footer>

      {/* Memory Detail Drawer */}
      <MemoryDrawer
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onSelectRelated={(id) => {
          const target = MEMORY_GRAPH_NODES.find((n) => n.id === id);
          if (target) handleSelectNode(target);
        }}
      />
    </div>
  );
}
