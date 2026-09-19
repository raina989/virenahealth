import { getIngredient, type MealSlot } from "@/lib/nutrition";

export type MealRow = {
  id: string;
  meal_slot: string;
  logged_at: string;
  items: unknown;
  carbs: number;
  protein: number;
  fats: number;
  calories: number;
};

const SLOT_ORDER: MealSlot[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function describe(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((raw) => {
      const i = raw as { ingredient?: string; amount?: number; unit?: string };
      if (!i?.ingredient) return null;
      const name = getIngredient(i.ingredient).name;
      const amount = i.amount ?? 0;
      return `${name} ${amount}${i.unit === "cup" ? " cup" : " g"}`;
    })
    .filter(Boolean)
    .join(" · ");
}

export function TodayPanel({ meals, title = "Today's log" }: { meals: MealRow[]; title?: string }) {
  const sorted = [...meals].sort((a, b) => {
    const d = SLOT_ORDER.indexOf(a.meal_slot as MealSlot) - SLOT_ORDER.indexOf(b.meal_slot as MealSlot);
    return d !== 0 ? d : a.logged_at.localeCompare(b.logged_at);
  });

  const total = sorted.reduce(
    (acc, m) => ({
      carbs: acc.carbs + Number(m.carbs),
      protein: acc.protein + Number(m.protein),
      fats: acc.fats + Number(m.fats),
      calories: acc.calories + Number(m.calories),
    }),
    { carbs: 0, protein: 0, fats: 0, calories: 0 },
  );

  return (
    <section className="surface p-6" aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">{title}</h2>
        {sorted.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {Math.round(total.calories)} kcal · {total.carbs.toFixed(0)}C / {total.protein.toFixed(0)}P /{" "}
            {total.fats.toFixed(0)}F
          </p>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 px-5 py-8 text-center text-sm text-muted-foreground">
          Nothing logged yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((m) => (
            <li key={m.id} className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{m.meal_slot}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(Number(m.calories))} kcal · {Number(m.carbs).toFixed(0)}C /{" "}
                  {Number(m.protein).toFixed(0)}P / {Number(m.fats).toFixed(0)}F
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{describe(m.items)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
