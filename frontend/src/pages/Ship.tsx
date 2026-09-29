import { useState, useEffect } from "react";
import { PageHeader } from "../components/Shell";
import { ExternalIcon, CheckIcon } from "../lib/icons";
import { EvidenceDrawer, TechnicalDetails } from "../components/DisclosurePrimitives";

export default function Ship() {
  const [articleUrl, setArticleUrl] = useState(() => localStorage.getItem("recall_ship_article") || "");
  const [linkedinUrl, setLinkedinUrl] = useState(() => localStorage.getItem("recall_ship_linkedin") || "");
  const [demoUrl, setDemoUrl] = useState(() => localStorage.getItem("recall_ship_demo") || "");
  const [redditUrl, setRedditUrl] = useState(() => localStorage.getItem("recall_ship_reddit") || "");
  const [feedback, setFeedback] = useState(() => localStorage.getItem("recall_ship_feedback") || "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [guidelinesDrawer, setGuidelinesDrawer] = useState<{
    title: string;
    description: string;
    checklist: string[];
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("recall_ship_article", articleUrl);
    localStorage.setItem("recall_ship_linkedin", linkedinUrl);
    localStorage.setItem("recall_ship_demo", demoUrl);
    localStorage.setItem("recall_ship_reddit", redditUrl);
    localStorage.setItem("recall_ship_feedback", feedback);
  }, [articleUrl, linkedinUrl, demoUrl, redditUrl, feedback]);

  const isValidUrl = (url: string) => {
    try {
      return Boolean(new URL(url).protocol.startsWith("http"));
    } catch {
      return false;
    }
  };

  const isArticleDone = isValidUrl(articleUrl);
  const isLinkedinDone = isValidUrl(linkedinUrl);
  const isDemoDone = isValidUrl(demoUrl);
  const isRedditDone = isValidUrl(redditUrl);

  const completedCount = [isArticleDone, isLinkedinDone, isDemoDone, isRedditDone].filter(Boolean).length;

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Rule 42: Dominant Page Header */}
      <PageHeader
        eyebrow="SUBMISSION WORKSPACE"
        title={
          <>
            MAKE THE WORK <span className="serif-italic text-brand-deep">VISIBLE.</span>
          </>
        }
        kicker="Four coordinates document your build. Complete each submission to finalize your project entry."
        right={
          <div className="flex items-center gap-3">
            <div className="mono text-[11px] bg-white border border-line px-3 py-1.5 rounded flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${completedCount === 4 ? "bg-brand" : "bg-amber-500"}`} />
              <span className="font-semibold text-ink">{completedCount} / 4 COORDINATES COMPLETE</span>
            </div>
          </div>
        }
      />

      {/* Four Crisp Coordinates (Rule 42) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COORDINATE 01: ARTICLE */}
        <div className="card p-6 bg-white border border-line shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="mono text-[10.5px] font-bold text-ink">01 // ARTICLE</span>
              <span className={`text-[10.5px] mono font-semibold px-2 py-0.5 rounded ${isArticleDone ? "bg-brand-soft text-brand-deep" : "bg-surface-subtle text-muted"}`}>
                {isArticleDone ? "Status: Verified" : "Status: Pending"}
              </span>
            </div>

            <div className="serif text-[20px] text-ink font-medium mt-3 leading-snug">
              Technical Architecture Write-Up
            </div>
            <p className="text-[13px] text-muted mt-1">
              In-depth publication (800–1,500 words) detailing stateful memory vs. stateless LLM queries.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                className="input mono text-xs w-full"
                placeholder="https://dev.to/username/recall-memory-first-agent"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
              />
              {isArticleDone && (
                <a href={articleUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost p-2" title="Open link">
                  <ExternalIcon size={13} />
                </a>
              )}
            </div>

            <button
              onClick={() =>
                setGuidelinesDrawer({
                  title: "Article Submission Guidelines",
                  description: "Your technical article is the primary documentation judges will evaluate for engineering depth.",
                  checklist: [
                    "Explain the problem of LLM amnesia in agent workflows.",
                    "Demonstrate Vectorize Hindsight memory integration and vector embeddings.",
                    "Showcase Groq Llama-3.3-70b tool calling and autonomous planning.",
                    "Include benchmark results: memory vs. generic prompts.",
                  ],
                })
              }
              className="text-[12px] text-brand-deep font-semibold hover:underline block"
            >
              Submission requirements →
            </button>
          </div>
        </div>

        {/* COORDINATE 02: LINKEDIN */}
        <div className="card p-6 bg-white border border-line shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="mono text-[10.5px] font-bold text-[#0077B5]">02 // LINKEDIN</span>
              <span className={`text-[10.5px] mono font-semibold px-2 py-0.5 rounded ${isLinkedinDone ? "bg-brand-soft text-brand-deep" : "bg-surface-subtle text-muted"}`}>
                {isLinkedinDone ? "Status: Verified" : "Status: Pending"}
              </span>
            </div>

            <div className="serif text-[20px] text-ink font-medium mt-3 leading-snug">
              Single Sharp Technical Insight
            </div>
            <p className="text-[13px] text-muted mt-1">
              Public post sharing the build story, video preview, and architectural learnings with the community.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                className="input mono text-xs w-full"
                placeholder="https://linkedin.com/posts/username_ai-agents-memory-..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
              {isLinkedinDone && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost p-2">
                  <ExternalIcon size={13} />
                </a>
              )}
            </div>

            <button
              onClick={() =>
                setGuidelinesDrawer({
                  title: "LinkedIn Post Guidelines",
                  description: "Share your project with the professional AI and frontend community.",
                  checklist: [
                    "Post from your personal or team LinkedIn profile.",
                    "Tag Vectorize, Groq, and relevant hackathon organizers.",
                    "Include 1-2 screenshots or demo video clip.",
                    "Share the key technical unlock: persistent agent memory.",
                  ],
                })
              }
              className="text-[12px] text-brand-deep font-semibold hover:underline block"
            >
              Submission requirements →
            </button>
          </div>
        </div>

        {/* COORDINATE 03: VIDEO */}
        <div className="card p-6 bg-white border border-line shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="mono text-[10.5px] font-bold text-brand-deep">03 // DEMO VIDEO</span>
              <span className={`text-[10.5px] mono font-semibold px-2 py-0.5 rounded ${isDemoDone ? "bg-brand-soft text-brand-deep" : "bg-surface-subtle text-muted"}`}>
                {isDemoDone ? "Status: Verified" : "Status: Pending"}
              </span>
            </div>

            <div className="serif text-[20px] text-ink font-medium mt-3 leading-snug">
              Product Walkthrough Demo
            </div>
            <p className="text-[13px] text-muted mt-1">
              2–3 minute screen recording demonstrating the agent remembering and formulating strategy.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                className="input mono text-xs w-full"
                placeholder="https://youtube.com/watch?v=... or Loom URL"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />
              {isDemoDone && (
                <a href={demoUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost p-2">
                  <ExternalIcon size={13} />
                </a>
              )}
            </div>

            <button
              onClick={() =>
                setGuidelinesDrawer({
                  title: "Demo Video Guidelines",
                  description: "Show the agent in action so evaluators can quickly witness the memory loop.",
                  checklist: [
                    "Show the Command Center asking a question with memory retrieval.",
                    "Show the Memory Vault and Knowledge Constellation graph.",
                    "Show Studio generating variants grounded in historical post saves.",
                    "Keep video under 3 minutes with clear audio narration.",
                  ],
                })
              }
              className="text-[12px] text-brand-deep font-semibold hover:underline block"
            >
              Submission requirements →
            </button>
          </div>
        </div>

        {/* COORDINATE 04: REDDIT */}
        <div className="card p-6 bg-white border border-line shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="mono text-[10.5px] font-bold text-[#FF4500]">04 // REDDIT</span>
              <span className={`text-[10.5px] mono font-semibold px-2 py-0.5 rounded ${isRedditDone ? "bg-brand-soft text-brand-deep" : "bg-surface-subtle text-muted"}`}>
                {isRedditDone ? "Status: Verified" : "Status: Pending"}
              </span>
            </div>

            <div className="serif text-[20px] text-ink font-medium mt-3 leading-snug">
              Community Engineering Discussion
            </div>
            <p className="text-[13px] text-muted mt-1">
              Developer community discussion post in r/webdev, r/LocalLLaMA, or r/SideProject.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                className="input mono text-xs w-full"
                placeholder="https://reddit.com/r/webdev/comments/..."
                value={redditUrl}
                onChange={(e) => setRedditUrl(e.target.value)}
              />
              {isRedditDone && (
                <a href={redditUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost p-2">
                  <ExternalIcon size={13} />
                </a>
              )}
            </div>

            <button
              onClick={() =>
                setGuidelinesDrawer({
                  title: "Reddit Discussion Guidelines",
                  description: "Engage genuine builders by asking for constructive feedback on stateful agents.",
                  checklist: [
                    "Post in relevant subreddits (r/webdev, r/SideProject, r/ArtificialInteligence).",
                    "Focus on engineering hurdles solved (memory decay, multi-tenant vector keys).",
                    "Respond to community questions and technical inquiries.",
                  ],
                })
              }
              className="text-[12px] text-brand-deep font-semibold hover:underline block"
            >
              Submission requirements →
            </button>
          </div>
        </div>
      </div>

      {/* Rule 43: Feedback Quiet and at Bottom */}
      <div className="card p-5 bg-white border border-line shadow-xs space-y-3 max-w-2xl mx-auto">
        <div className="mono text-[10.5px] uppercase tracking-wider text-muted font-bold">
          BUILD LOG & JUDGE NOTES (OPTIONAL)
        </div>
        <textarea
          className="input w-full text-[13px] leading-relaxed"
          rows={3}
          placeholder="Any notes, credentials, or context for the judging panel…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>Automatically saved to local storage</span>
          {savedMsg && <span className="text-brand-deep font-semibold">{savedMsg}</span>}
        </div>
      </div>

      {/* Guidelines Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(guidelinesDrawer)}
        onClose={() => setGuidelinesDrawer(null)}
        title={guidelinesDrawer?.title || "Submission Guidelines"}
        subtitle={guidelinesDrawer?.description}
        badge="SUBMISSION CHECKLIST"
      >
        {guidelinesDrawer && (
          <div className="space-y-4">
            <div className="text-[11px] uppercase tracking-wider font-mono text-muted font-semibold">
              Evaluation Criteria Checklist
            </div>
            <div className="space-y-2.5">
              {guidelinesDrawer.checklist.map((item, idx) => (
                <div key={idx} className="p-3 bg-surface border border-line rounded-lg flex items-start gap-2.5 text-[13px] text-pen">
                  <span className="text-brand-deep font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </EvidenceDrawer>
    </div>
  );
}
