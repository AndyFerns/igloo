"use client";

/**
 * <MentorCompanion /> — the friendly mentor presence.
 *
 * This is deliberately isolated behind a single component so a future
 * Three.js / React Three Fiber creature can be dropped in without touching the
 * surrounding UI. To upgrade later: render an <R3FCompanion mood={mood}/> here
 * instead of the SVG, keeping the same props. The SVG below is an ORIGINAL,
 * license-free friendly "Mewrin spark" mascot — not a copyrighted character.
 */

export type CompanionMood = "idle" | "thinking" | "happy" | "speaking";

const sizes = {
  sm: 44,
  md: 72,
  lg: 128,
};

export function MentorCompanion({
  mood = "idle",
  size = "md",
  className = "",
}: {
  mood?: CompanionMood;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const px = sizes[size];
  const thinking = mood === "thinking";
  const happy = mood === "happy";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {/* soft glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl ${
          thinking ? "animate-pulse-soft" : ""
        }`}
        style={{ background: "radial-gradient(circle, rgba(240,82,27,0.28), transparent 70%)" }}
      />
      <svg viewBox="0 0 100 100" width={px} height={px} className="relative">
        <defs>
          <radialGradient id="mc-body" cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#FFF3EC" />
            <stop offset="55%" stopColor="#FFB894" />
            <stop offset="100%" stopColor="#F0521B" />
          </radialGradient>
        </defs>

        {/* rounded friendly body */}
        <g className={thinking ? "animate-drift" : ""}>
          <path
            d="M50 12 C70 12 84 28 84 50 C84 74 68 90 50 90 C32 90 16 74 16 50 C16 28 30 12 50 12 Z"
            fill="url(#mc-body)"
            stroke="#D8410F"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          {/* little Mewrin/spark crest */}
          <path
            d="M50 6 L54 16 L50 14 L46 16 Z"
            fill="#F0521B"
          />

          {/* eyes */}
          <circle cx="39" cy="47" r="4.6" fill="#2A1B12" />
          <circle cx="61" cy="47" r="4.6" fill="#2A1B12" />
          <circle cx="40.6" cy="45.4" r="1.4" fill="#fff" />
          <circle cx="62.6" cy="45.4" r="1.4" fill="#fff" />

          {/* mouth: happy vs calm */}
          {happy ? (
            <path d="M40 60 Q50 70 60 60" fill="none" stroke="#2A1B12" strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <path d="M42 62 Q50 67 58 62" fill="none" stroke="#2A1B12" strokeWidth="2.2" strokeLinecap="round" />
          )}

          {/* cheeks */}
          <circle cx="31" cy="57" r="3.4" fill="#FF7A45" opacity="0.5" />
          <circle cx="69" cy="57" r="3.4" fill="#FF7A45" opacity="0.5" />
        </g>

        {/* thinking dots */}
        {thinking && (
          <g>
            <circle cx="84" cy="24" r="2.4" fill="#F0521B" className="animate-pulse-soft" />
            <circle cx="90" cy="18" r="1.8" fill="#FF7A45" className="animate-pulse-soft" />
          </g>
        )}
      </svg>
    </div>
  );
}
