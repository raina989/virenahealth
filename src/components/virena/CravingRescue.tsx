import { useState } from "react";
import { CRAVING_RECIPES } from "@/lib/guidance";

export function CravingRescue() {
  const [active, setActive] = useState(CRAVING_RECIPES[0]!.craving);
  const recipe = CRAVING_RECIPES.find((r) => r.craving === active) ?? CRAVING_RECIPES[0]!;

  return (
    <section className="surface p-6" aria-label="Craving rescue">
      <h2 className="font-display text-xl">Craving rescue</h2>
      <p className="text-sm text-muted-foreground">
        Pick what you're craving — here's the version that loves you back.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CRAVING_RECIPES.map((r) => (
          <button
            key={r.craving}
            type="button"
            aria-pressed={active === r.craving}
            onClick={() => setActive(r.craving)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              active === r.craving
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 hover:bg-secondary"
            }`}
          >
            {r.craving}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-5">
        <h3 className="font-display text-lg">{recipe.title}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {recipe.ingredients.map((i) => (
            <li key={i} className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
              {i}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">{recipe.method}</p>
        <p className="mt-2 text-sm font-medium text-protein">{recipe.win}</p>
      </div>
    </section>
  );
}
