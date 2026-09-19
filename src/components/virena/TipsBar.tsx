import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

export function TipsBar({ tips, label }: { tips: string[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || tips.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % tips.length), 30_000);
    return () => window.clearInterval(timer);
  }, [paused, tips.length]);

  if (tips.length === 0) return null;

  return (
    <section
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="flex items-center gap-3 rounded-2xl border border-border bg-accent/40 px-5 py-4"
    >
      <Lightbulb className="h-5 w-5 shrink-0 text-clay" aria-hidden />
      <p className="flex-1 text-sm text-accent-foreground" aria-live="polite">
        {tips[index % tips.length]}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Previous tip"
          onClick={() => setIndex((i) => (i - 1 + tips.length) % tips.length)}
          className="rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next tip"
          onClick={() => setIndex((i) => (i + 1) % tips.length)}
          className="rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
