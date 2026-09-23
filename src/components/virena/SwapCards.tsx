import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  PRIORITY_LABELS,
  resolveByPriority,
  type SwapOption,
  type SwapPriority,
  type TieredSwap,
} from "@/lib/swaps";

type Props = {
  swaps: TieredSwap[];
  onApply: (originalKey: string, ingredientId: string) => void;
};

type Chosen = { swap: TieredSwap; option: SwapOption; priority: SwapPriority };

export function SwapCards({ swaps, onApply }: Props) {
  const [priorityFor, setPriorityFor] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, Chosen>>({});
  const [survey, setSurvey] = useState<Chosen | null>(null);

  if (swaps.length === 0) return null;

  function choose(swap: TieredSwap, priority: SwapPriority) {
    const option = resolveByPriority(swap, priority);
    setChosen((prev) => ({ ...prev, [swap.key]: { swap, option, priority } }));
    setPriorityFor(null);
  }

  return (
    <section className="surface p-6" aria-label="Smarter swaps">
      <h2 className="font-display text-xl">Smarter swaps</h2>
      <p className="text-sm text-muted-foreground">
        Pick the trade-off that fits you today — health, balance, or taste.
      </p>

      <ul className="mt-5 space-y-5">
        {swaps.map((swap) => {
          const pick = chosen[swap.key];
          return (
            <li key={swap.key} className="rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="space-y-2">
                <Tier
                  dot="🟢"
                  tier="Best metabolic option"
                  option={swap.best}
                  onChoose={() => setPriorityFor(swap.key)}
                />
                <Tier
                  dot="🟡"
                  tier="Balanced option"
                  option={swap.balanced}
                  onChoose={() => setPriorityFor(swap.key)}
                />
                <Tier dot="🔴" tier="Original" option={swap.original} />
              </div>

              {priorityFor === swap.key ? (
                <div className="mt-4 rounded-xl border border-accent bg-accent/40 px-4 py-3">
                  <p className="text-sm font-medium">What's your priority?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRIORITY_LABELS.map((p) => (
                      <Button key={p.id} size="sm" variant="secondary" onClick={() => choose(swap, p.id)}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {pick ? (
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <p className="text-sm">
                    <span className="font-medium">
                      You chose {PRIORITY_LABELS.find((p) => p.id === pick.priority)?.label}
                    </span>{" "}
                    → try <span className="font-medium">{pick.option.name}</span> instead.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{pick.option.why}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pick.option.ingredientId ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          onApply(swap.key, pick.option.ingredientId!);
                          toast.success(`${pick.option.name} is on your plate.`);
                        }}
                      >
                        <ArrowRight className="mr-1.5 h-4 w-4" /> Put it on my plate
                      </Button>
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => setSurvey(pick)}>
                      Tried this swap? Tell us
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {survey ? <SwapSurvey chosen={survey} onDone={() => setSurvey(null)} /> : null}
    </section>
  );
}

function Tier({
  dot,
  tier,
  option,
  onChoose,
}: {
  dot: string;
  tier: string;
  option: SwapOption;
  onChoose?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <span aria-hidden>{dot}</span>
      <div className="min-w-[10rem] flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{tier}</p>
        <p className="font-medium">{option.name}</p>
        <p className="text-xs text-muted-foreground">
          Health {option.health}/10 · Taste match {option.taste}/10
        </p>
      </div>
      {onChoose ? (
        <Button size="sm" variant="secondary" onClick={onChoose}>
          Choose
        </Button>
      ) : null}
    </div>
  );
}

const STEPS = ["made", "taste", "closeness", "repeat"] as const;

function SwapSurvey({ chosen, onDone }: { chosen: Chosen; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [made, setMade] = useState<boolean | null>(null);
  const [taste, setTaste] = useState<number | null>(null);
  const [closeness, setCloseness] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(repeat: string | null, madeIt = made) {
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await supabase.from("swap_feedback").insert({
      user_id: auth.user.id,
      swap_key: chosen.swap.key,
      original_name: chosen.swap.original.name,
      chosen_name: chosen.option.name,
      priority: chosen.priority,
      made_it: madeIt,
      taste_rating: taste,
      closeness_rating: closeness,
      would_repeat: repeat,
    });
    setSaving(false);
    if (error) toast.error("We couldn't save your feedback.");
    else toast.success("Thank you — that helps us recommend better swaps.");
    onDone();
  }

  const current = STEPS[step]!;

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card px-5 py-4" aria-label="Swap feedback">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{chosen.option.name}</p>

      {current === "made" ? (
        <>
          <p className="mt-1 font-medium">Did you make or buy this swap?</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setMade(true);
                setStep(1);
              }}
            >
              Yes
            </Button>
            <Button size="sm" variant="outline" disabled={saving} onClick={() => void save(null, false)}>
              Not yet
            </Button>
          </div>
        </>
      ) : null}

      {current === "taste" ? (
        <>
          <p className="mt-1 font-medium">How did it taste?</p>
          <Stars value={taste} onChange={(v) => { setTaste(v); setStep(2); }} />
        </>
      ) : null}

      {current === "closeness" ? (
        <>
          <p className="mt-1 font-medium">How close was it to the original?</p>
          <Stars value={closeness} onChange={(v) => { setCloseness(v); setStep(3); }} />
        </>
      ) : null}

      {current === "repeat" ? (
        <>
          <p className="mt-1 font-medium">Would you make this swap again?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Definitely", "Maybe", "No"].map((r) => (
              <Button key={r} size="sm" variant="secondary" disabled={saving} onClick={() => void save(r)}>
                {r}
              </Button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stars({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="mt-3 flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" aria-label={`${n} stars`} onClick={() => onChange(n)}>
          <Star
            className={`h-6 w-6 ${value && value >= n ? "fill-clay text-clay" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}
