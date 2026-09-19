import { Link } from "@tanstack/react-router";
import { Moon } from "lucide-react";
import type { PhaseInfo } from "@/lib/guidance";

export function PhaseBanner({ phase }: { phase: PhaseInfo | null }) {
  if (!phase) {
    return (
      <section className="rounded-2xl border border-border bg-secondary/50 px-5 py-4" aria-label="Cycle phase">
        <p className="text-sm">
          Log your last period on the{" "}
          <Link to="/history" className="font-medium underline">
            calendar
          </Link>{" "}
          and Virena will tailor every day's food guidance to your cycle phase.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-border bg-[image:var(--gradient-warm,none)] bg-accent/40 px-5 py-4"
      aria-label="Cycle phase guidance"
    >
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-clay" aria-hidden />
        <p className="font-medium">
          Day {phase.cycleDay} · {phase.label} phase
        </p>
      </div>
      <p className="mt-1 text-sm text-accent-foreground">{phase.headline}</p>
      <ul className="mt-3 space-y-1.5">
        {phase.foods.map((f) => (
          <li key={f} className="text-sm text-muted-foreground">
            • {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
