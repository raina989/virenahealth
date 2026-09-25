import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CUISINES, mealIdeasFor, type Cuisine, type MealIdea, type MealIdeaSlot } from "@/lib/meal-ideas";
import { imageForCuisine, imageForMeal, slugify } from "@/lib/pexels";

type Props = {
  onApply: (items: { ingredientId: string; amount: number }[]) => void;
  pcosMode: boolean;
  goal: string | null;
  phaseId: string | null;
};

export function MealFinder({ onApply, pcosMode, goal, phaseId }: Props) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<MealIdeaSlot | null>(null);
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [ideas, setIdeas] = useState<MealIdea[]>([]);

  useEffect(() => {
    if (!cuisine || !slot) {
      setIdeas([]);
      return;
    }
    setIdeas(mealIdeasFor(cuisine.id, slot, goal, phaseId ?? undefined));
  }, [cuisine, slot, goal, phaseId]);

  function reset() {
    setOpen(false);
    setSlot(null);
    setCuisine(null);
    setIdeas([]);
  }

  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 z-40 gap-2 rounded-full shadow-[var(--shadow-lift)]"
        onClick={() => setOpen(true)}
      >
        <Lightbulb className="h-5 w-5" />
        Need recommendations
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={reset}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-border bg-background p-6 shadow-[var(--shadow-lift)] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Need recommendations</h2>
              <Button variant="ghost" size="icon" onClick={reset} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!slot ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">What meal are you planning?</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["Breakfast", "Lunch", "Dinner"] as MealIdeaSlot[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className="surface p-5 text-center transition-transform hover:scale-[1.02]"
                    >
                      <span className="block font-display text-lg">{s}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : !cuisine ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  What do you feel like having for {slot.toLowerCase()}?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CUISINES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCuisine(c)}
                      className="surface flex flex-col items-center gap-1 p-5 text-center transition-transform hover:scale-[1.02]"
                    >
                      <span className="text-2xl">{c.emoji}</span>
                      <span className="text-sm font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSlot(null)}>
                  Back
                </Button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cuisine.emoji} {cuisine.label} {slot.toLowerCase()} ideas
                  {pcosMode ? " · adapted for PCOS" : ""}
                </p>
                <div className="mt-4 space-y-4">
                  {ideas.map((idea) => {
                    const slug = slugify(idea.title);
                    return (
                      <div
                        key={idea.id}
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
                      >
                        <img
                          src={imageForMeal(slug, cuisine.id)}
                          alt={idea.title}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-5">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-display text-lg">{idea.title}</h3>
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                              {idea.slot}
                            </span>
                          </div>
                          <dl className="mt-3 space-y-1.5">
                            {idea.lines.map((line) => (
                              <div key={line.label} className="flex gap-2 text-sm">
                                <dt className="w-28 shrink-0 font-medium text-muted-foreground">{line.label}</dt>
                                <dd>{line.value}</dd>
                              </div>
                            ))}
                          </dl>
                          <Button
                            className="mt-4 w-full gap-2"
                            onClick={() => {
                              onApply(idea.plate);
                              reset();
                            }}
                          >
                            <ArrowRight className="h-4 w-4" /> Log to plate
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setCuisine(null)}>
                  Back to cuisines
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
