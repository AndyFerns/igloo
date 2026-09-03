"use client";

// Original abstract "knowledge flow" visual — a warm particle/wave field that
// evokes an AI synthesizing signal from noise. Pure inline SVG, no assets, no
// external branding. Used in the landing hero.
export function AbstractFlow({ className = "" }: { className?: string }) {
  const dots = [];
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const x = 40 + t * 300;
    const jitter = Math.sin(i * 1.7) * (24 * (1 - t)) + Math.cos(i * 0.9) * 8;
    const y = 150 + jitter * (1.4 - t);
    const r = 0.7 + (t > 0.6 ? 0 : Math.random() * 1.4);
    const o = 0.15 + t * 0.05 + Math.random() * 0.3 * (1 - t);
    dots.push(<circle key={i} cx={x} cy={y} r={r} fill="#171512" opacity={o} />);
  }
  return (
    <svg
      viewBox="0 0 560 300"
      className={className}
      role="img"
      aria-label="Abstract visualization of an AI turning scattered information into a clear signal"
    >
      <defs>
        <linearGradient id="flowA" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F0521B" stopOpacity="0" />
          <stop offset="55%" stopColor="#F0521B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF7A45" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="flowB" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F0521B" stopOpacity="0" />
          <stop offset="70%" stopColor="#F0521B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF7A45" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A45" />
          <stop offset="100%" stopColor="#F0521B" />
        </radialGradient>
      </defs>

      {/* Noise field resolving into order */}
      <g className="animate-drift">{dots}</g>

      {/* Converging flow lines */}
      <path
        d="M40 150 C 180 150, 240 120, 340 150 C 430 176, 470 150, 520 150"
        fill="none"
        stroke="url(#flowA)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 168 C 200 168, 250 200, 350 168 C 440 140, 480 168, 520 158"
        fill="none"
        stroke="url(#flowB)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M60 132 C 200 132, 250 104, 350 132 C 440 158, 480 132, 520 142"
        fill="none"
        stroke="url(#flowB)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Resolved insight node */}
      <circle cx="520" cy="150" r="9" fill="url(#node)" className="animate-pulse-soft" />
      <circle cx="520" cy="150" r="16" fill="none" stroke="#F0521B" strokeOpacity="0.25" />
    </svg>
  );
}
