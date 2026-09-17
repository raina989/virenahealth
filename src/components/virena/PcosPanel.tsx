import { Checkbox } from "@/components/ui/checkbox";
import { CYCLE_PHASES, SYMPTOMS } from "@/lib/nutrition";

type Props = {
  phase: string;
  onPhaseChange: (phase: string) => void;
  symptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
};

export function PcosPanel({ phase, onPhaseChange, symptoms, onSymptomsChange }: Props) {
  const active = CYCLE_PHASES.find((p) => p.id === phase) ?? CYCLE_PHASES[0];

  function toggle(symptom: string) {
    onSymptomsChange(
      symptoms.includes(symptom) ? symptoms.filter((s) => s !== symptom) : [...symptoms, symptom],
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="surface p-6" aria-label="Cycle phase tracker">
        <h2 className="font-display text-xl">Cycle phase</h2>
        <p className="text-sm text-muted-foreground">Where are you today?</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
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

      <section className="surface p-6" aria-label="Hormonal symptom log">
        <h2 className="font-display text-xl">Symptoms today</h2>
        <p className="text-sm text-muted-foreground">Tick what you're feeling — patterns build over time.</p>

        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          {SYMPTOMS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <Checkbox
                id={`symptom-${s}`}
                checked={symptoms.includes(s)}
                onCheckedChange={() => toggle(s)}
              />
              <label htmlFor={`symptom-${s}`} className="text-sm">
                {s}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
