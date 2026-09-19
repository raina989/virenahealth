import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { SYMPTOMS } from "@/lib/nutrition";
import { MOODS, dailyInsight } from "@/lib/guidance";

export type CheckInState = {
  mood: string | null;
  symptoms: string[];
  sleepStart: string;
  sleepEnd: string;
};

export function sleepHours(start: string, end: string): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return null;
  let mins = (eh! * 60 + em!) - (sh! * 60 + sm!);
  if (mins <= 0) mins += 24 * 60;
  return Number((mins / 60).toFixed(1));
}

type Props = {
  value: CheckInState;
  onChange: (next: CheckInState) => void;
  onSave: () => void;
  saving: boolean;
};

export function DailyCheckIn({ value, onChange, onSave, saving }: Props) {
  const hours = sleepHours(value.sleepStart, value.sleepEnd);
  const insights = useMemo(
    () => dailyInsight({ mood: value.mood, symptoms: value.symptoms, sleepHours: hours }),
    [value.mood, value.symptoms, hours],
  );

  function toggleSymptom(s: string) {
    onChange({
      ...value,
      symptoms: value.symptoms.includes(s)
        ? value.symptoms.filter((x) => x !== s)
        : [...value.symptoms, s],
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="surface p-6" aria-label="Daily check-in">
        <h2 className="font-display text-xl">How are you today?</h2>
        <p className="text-sm text-muted-foreground">Mood, symptoms and sleep — all saved to today's log.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={value.mood === m}
              onClick={() => onChange({ ...value, mood: value.mood === m ? null : m })}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                value.mood === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary/40 hover:bg-secondary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-medium">Symptoms</h3>
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {SYMPTOMS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <Checkbox
                id={`sym-${s}`}
                checked={value.symptoms.includes(s)}
                onCheckedChange={() => toggleSymptom(s)}
              />
              <label htmlFor={`sym-${s}`} className="text-sm">
                {s}
              </label>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-sm font-medium">Sleep</h3>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <label className="text-xs text-muted-foreground">
            Fell asleep
            <Input
              type="time"
              value={value.sleepStart}
              onChange={(e) => onChange({ ...value, sleepStart: e.target.value })}
              className="mt-1 w-32 bg-background"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Woke up
            <Input
              type="time"
              value={value.sleepEnd}
              onChange={(e) => onChange({ ...value, sleepEnd: e.target.value })}
              className="mt-1 w-32 bg-background"
            />
          </label>
          {hours !== null ? (
            <p className="pb-2 text-sm">
              <span className="font-medium">{hours} h</span>{" "}
              <span className="text-muted-foreground">
                {hours < 6 ? "— short night" : hours < 7 ? "— nearly there" : "— well rested"}
              </span>
            </p>
          ) : null}
        </div>

        <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
          Connect a wearable (Apple Health, Oura, Fitbit, Garmin) — coming soon.
        </p>

        <div className="mt-5 flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save check-in"}
          </Button>
        </div>
      </section>

      <section className="surface p-6" aria-label="Today's insight">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-clay" aria-hidden />
          <h2 className="font-display text-xl">Today's insight</h2>
        </div>
        {insights.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Pick a mood or tick a symptom and Virena will give you something practical to do about it.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {insights.map((t) => (
              <li key={t} className="rounded-xl border border-accent bg-accent/40 px-4 py-3 text-sm text-accent-foreground">
                {t}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
