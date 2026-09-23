import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Moon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PHASE_ACTIONS, type PhaseInfo } from "@/lib/guidance";

function weekKey(): string {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `virena-phase-checks-${d.getFullYear()}-${week}`;
}

export function PhaseBanner({ phase }: { phase: PhaseInfo | null }) {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(weekKey());
      if (raw) setChecked(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(item: string) {
    setChecked((prev) => {
      const next = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];
      try {
        localStorage.setItem(weekKey(), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

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

  const actions = PHASE_ACTIONS[phase.id];

  return (
    <section
      className="rounded-2xl border border-border bg-[image:var(--gradient-warm,none)] bg-accent/40 px-5 py-5"
      aria-label="Cycle phase guidance"
    >
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-clay" aria-hidden />
        <p className="font-medium">
          {phase.extended
            ? `You're in an extended luteal phase`
            : `You're in your ${phase.label.toLowerCase()} phase`}
        </p>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Day {phase.cycleDay}
        {phase.extended
          ? ` · your period is ${phase.overdueDays} ${phase.overdueDays === 1 ? "day" : "days"} later than your usual ${phase.cycleLength}-day rhythm`
          : ` of about ${phase.cycleLength}`}{" "}
        · {phase.confidence}
      </p>

      <p className="mt-2 text-sm text-accent-foreground">{phase.headline}</p>

      <h3 className="mt-4 text-sm font-medium">What to prioritise this week</h3>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["Eat", actions.eat],
            ["Move", actions.move],
          ] as const
        ).map(([title, list]) => (
          <div key={title}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <ul className="mt-2 space-y-2">
              {list.map((item) => {
                const id = `${phase.id}-${item}`;
                return (
                  <li key={item} className="flex items-start gap-2">
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={checked.includes(id)}
                      onCheckedChange={() => toggle(id)}
                    />
                    <label
                      htmlFor={id}
                      className={`text-sm ${checked.includes(id) ? "text-muted-foreground line-through" : ""}`}
                    >
                      {item}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
