import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your Virena profile" },
      { name: "description", content: "A few quick questions so Virena can personalise your plate guidance." },
      { property: "og:title", content: "Set up your Virena profile" },
      { property: "og:description", content: "Tell Virena your goals and it will tailor every recommendation." },
    ],
  }),
  component: Onboarding,
});

const GOALS = [
  { id: "pcos", label: "Manage PCOS", body: "Cycle-aware eating, insulin sensitivity and symptom tracking." },
  { id: "glucose", label: "Steady my glucose", body: "Fewer crashes, flatter curves, more even energy." },
  { id: "healthier", label: "Just eat healthier", body: "Balanced plates without counting every calorie." },
  { id: "body-comp", label: "Body composition", body: "Protein-forward plates while keeping energy stable." },
];

const FOCUS = [
  "Energy crashes",
  "Sugar cravings",
  "Bloating",
  "Acne & skin",
  "Mood & anxiety",
  "Sleep quality",
  "Cycle regularity",
  "Hair health",
];

const ACTIVITY = ["Mostly resting", "Lightly active", "Active", "Very active"];
const DIET = ["No restrictions", "Vegetarian", "Vegan", "Pescatarian", "Halal", "Gluten-free"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [pcos, setPcos] = useState<"yes" | "suspected" | "no" | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [activity, setActivity] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const steps = [
    { title: "What brings you to Virena?", subtitle: "This shapes every recommendation you'll see." },
    { title: "Have you been diagnosed with PCOS?", subtitle: "We'll switch on PCOS mode by default if so." },
    { title: "What would you most like to improve?", subtitle: "Pick as many as feel true." },
    { title: "A little about your day", subtitle: "Last one, we promise." },
  ];

  const canContinue = [goal !== null, pcos !== null, true, activity !== null && diet !== null][step];

  async function finish() {
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        primary_goal: goal,
        has_pcos: pcos === "yes",
        default_mode: pcos === "no" && goal !== "pcos" ? "general" : "pcos",
        focus_areas: focus,
        activity_level: activity,
        dietary_pattern: diet,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id);

    setSaving(false);
    if (error) {
      toast.error("We couldn't save your answers. Please try again.");
      return;
    }
    void navigate({ to: "/dashboard" });
  }

  return (
    <main className="min-h-screen warm-gradient px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <span className="font-display text-2xl">Virena</span>

        <div className="mt-8 flex gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <div className="surface mt-6 p-8">
          <h1 className="text-3xl">{steps[step]?.title}</h1>
          <p className="mt-2 text-muted-foreground">{steps[step]?.subtitle}</p>

          <div className="mt-7 space-y-3">
            {step === 0 &&
              GOALS.map((g) => (
                <OptionCard
                  key={g.id}
                  selected={goal === g.id}
                  onClick={() => setGoal(g.id)}
                  title={g.label}
                  body={g.body}
                />
              ))}

            {step === 1 &&
              (
                [
                  { id: "yes", label: "Yes, diagnosed", body: "PCOS mode on by default, with strict high-GI flags." },
                  { id: "suspected", label: "I suspect it", body: "We'll keep PCOS tools one tap away." },
                  { id: "no", label: "No", body: "General wellness mode, with PCOS mode still available." },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={o.id}
                  selected={pcos === o.id}
                  onClick={() => setPcos(o.id)}
                  title={o.label}
                  body={o.body}
                />
              ))}

            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {FOCUS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={focus.includes(f)}
                    onClick={() =>
                      setFocus(focus.includes(f) ? focus.filter((x) => x !== f) : [...focus, f])
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      focus.includes(f)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <ChipRow label="How active are you, typically?" options={ACTIVITY} value={activity} onChange={setActivity} />
                <ChipRow label="How do you eat?" options={DIET} value={diet} onChange={setDiet} />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || saving}
            >
              Back
            </Button>
            <Button
              onClick={() => (step === steps.length - 1 ? void finish() : setStep((s) => s + 1))}
              disabled={!canContinue || saving}
            >
              {step === steps.length - 1 ? (saving ? "Saving…" : "Enter Virena") : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`block w-full rounded-xl border px-5 py-4 text-left transition-colors ${
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/40 hover:bg-secondary"
      }`}
    >
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-sm opacity-80">{body}</span>
    </button>
  );
}

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              value === o
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 hover:bg-secondary"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
