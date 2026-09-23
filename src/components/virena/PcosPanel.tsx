import { CYCLE_PHASES } from "@/lib/nutrition";

type Props = {
  phase: string;
  onPhaseChange: (phase: string) => void;
};

export function PcosPanel({ phase, onPhaseChange }: Props) {
  const active = CYCLE_PHASES.find((p) => p.id === phase) ?? CYCLE_PHASES[0];

  return (
    <section className="surface p-6" aria-label="Cycle phase tracker">
      <h2 className="font-display text-xl">Cycle phase</h2>
      <p className="text-sm text-muted-foreground">
        Where are you today? Symptoms live in your daily check-in above.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {CYCLE_PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPhaseChange(p.id)}
            aria-pressed={phase === p.id}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              phase === p.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 hover:bg-secondary"
            }`}
          >
            <span className="block text-sm font-medium">{p.label}</span>
            <span className="block text-xs opacity-75">{p.days}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-accent/50 px-4 py-3 text-sm text-accent-foreground">{active.focus}</p>
    </section>
  );
}
