import Link from "next/link";
import { forwardRef } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus-accent disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variants: Record<string, string> = {
  primary: "bg-ink text-canvas hover:bg-[#241f1a] shadow-sm",
  accent: "bg-accent text-white hover:bg-accent-soft shadow-sm",
  secondary: "bg-surface text-ink border border-line hover:border-ink/30 hover:bg-white",
  ghost: "text-ink-soft hover:text-ink hover:bg-black/[0.04]",
};

const sizes: Record<string, string> = {
  sm: "text-sm px-3.5 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", href, className = "", children, ...rest },
  ref
) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  );
});

export function Card({
  className = "",
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: any;
}) {
  return (
    <Tag
      className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "warn" | "muted" | "ink";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-black/[0.04] text-ink-soft",
    accent: "bg-accent-wash text-accent border border-accent/15",
    warn: "bg-amber-50 text-amber-700 border border-amber-200",
    muted: "bg-black/[0.03] text-ink-faint",
    ink: "bg-ink text-canvas",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </div>
      )}
      <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {desc && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">{desc}</p>}
    </div>
  );
}

/** Small labelled list block used across sections. */
export function LabeledList({
  label,
  items,
  tone = "neutral",
}: {
  label: string;
  items: string[];
  tone?: "neutral" | "accent";
}) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
            <span
              className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                tone === "accent" ? "bg-accent" : "bg-ink-faint"
              }`}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-line ${className}`} />;
}
