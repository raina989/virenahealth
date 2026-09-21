import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [tracksCycle, setTracksCycle] = useState<boolean | null>(null);
  const [pcos, setPcos] = useState<"yes" | "suspected" | "no" | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [activity, setActivity] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const steps = [
    { key: "goal", title: "What brings you to Virena?", subtitle: "This shapes every recommendation you'll see." },
    {
      key: "cycle",
      title: "Do you track a menstrual cycle?",
      subtitle: "If not, Virena hides cycle and PCOS tools and focuses on metabolic performance.",
    },
    ...(tracksCycle
      ? [
          {
            key: "pcos",
            title: "Have you been diagnosed with PCOS?",
            subtitle: "We'll switch on PCOS mode by default if so.",
          },
        ]
      : []),
    { key: "focus", title: "What would you most like to improve?", subtitle: "Pick as many as feel true." },
    { key: "day", title: "A little about your day", subtitle: "Last one, we promise." },
  ];

  const current = steps[step]?.key;
  const canContinue =
    current === "goal"
      ? goal !== null
      : current === "cycle"
        ? tracksCycle !== null
        : current === "pcos"
          ? pcos !== null
          : current === "day"
            ? activity !== null && diet !== null
            : true;

  async function finish() {
    if (saving) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSaving(false);
      return;
    }
    const usesPcos = tracksCycle === true && (pcos === "yes" || pcos === "suspected" || goal === "pcos");
    const { error } = await supabase
      .from("profiles")
      .update({
        primary_goal: goal,
        tracks_cycle: tracksCycle === true,
        has_pcos: tracksCycle === true && pcos === "yes",
        default_mode: usesPcos ? "pcos" : "general",
        focus_areas: focus,
        activity_level: activity,
        dietary_pattern: diet,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id);

    if (error) {
      setSaving(false);
      toast.error("We couldn't save your answers. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.refetchQueries({ queryKey: ["profile"] });
    setSaving(false);
    void navigate({ to: "/dashboard", replace: true });
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
            {current === "goal" &&
              GOALS.map((g) => (
                <OptionCard
                  key={g.id}
                  selected={goal === g.id}
                  onClick={() => setGoal(g.id)}
                  title={g.label}
                  body={g.body}
                />
              ))}

            {current === "cycle" &&
              (
                [
                  { id: true, label: "Yes, I track my cycle", body: "Cycle phases, period logging and PCOS tools stay on." },
                  { id: false, label: "No", body: "Virena hides cycle tools and focuses on metabolic performance." },
                ] as const
              ).map((o) => (
                <OptionCard
                  key={String(o.id)}
                  selected={tracksCycle === o.id}
                  onClick={() => {
                    setTracksCycle(o.id);
                    if (!o.id) setPcos(null);
                  }}
                  title={o.label}
                  body={o.body}
                />
              ))}

            {current === "pcos" &&
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

            {current === "focus" && (
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

            {current === "day" && (
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
