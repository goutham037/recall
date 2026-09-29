import { useState, useRef, useEffect } from "react";

export function HeroVideoPlayer() {
  // Sound on by default as requested
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    const promise = video.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If browser strictly blocks unmuted autoplay without prior interaction,
          // mute temporarily for autoplay and notify via badge
          video.muted = true;
          video.play().catch(() => { });
          setIsMuted(true);
        });
    }
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (video.paused) {
      video.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full rounded-[14px] border border-line bg-surface overflow-hidden shadow-xs group">
      {/* Top Bar / Watermark */}
      <div className="px-4 py-2.5 bg-surface-subtle border-b border-line flex items-center justify-between text-[11px] mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="font-semibold text-ink uppercase tracking-wider">
            PRODUCT DEMO · RECALL IN ACTION
          </span>
        </div>

        {/* Sound Toggle Button / Indicator */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className={`px-2.5 py-1 rounded text-[10.5px] font-semibold transition-colors flex items-center gap-1.5 ${!isMuted
            ? "bg-brand-soft text-brand-deep border border-brand/30"
            : "bg-quiet text-muted border border-line"
            }`}
          title="Click to toggle sound"
        >
          {!isMuted ? (
            <>
              <SoundOnIcon />
              <span>SOUND ON (CLICK TO MUTE)</span>
            </>
          ) : (
            <>
              <SoundOffIcon />
              <span>MUTED (CLICK TO UNMUTE)</span>
            </>
          )}
        </button>
      </div>

      {/* Video Container - Clicking anywhere on video toggles mute internally */}
      <div
        onClick={toggleMute}
        className="relative cursor-pointer bg-black aspect-video flex items-center justify-center overflow-hidden"
      >
        <video
          ref={videoRef}
          src="Demo_Video.mp4"
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

function SoundOnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
