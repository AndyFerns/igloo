import Link from "next/link";
import { Button } from "./ui";

export function Wordmark() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink">
        <span className="absolute h-2.5 w-2.5 rounded-[3px] bg-accent transition-transform group-hover:rotate-45" />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Frost<span className="text-ink-faint font-normal"> · mentor</span>
      </span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3.5 sm:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          <a href="#how" className="hover:text-ink transition-colors">How it works</a>
          <a href="#sections" className="hover:text-ink transition-colors">What you get</a>
          <a href="#principles" className="hover:text-ink transition-colors">Approach</a>
        </nav>
        <Button href="/mentor" size="sm">Start mentoring</Button>
      </div>
    </header>
  );
}
