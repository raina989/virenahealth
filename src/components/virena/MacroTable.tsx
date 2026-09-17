import type { Macros } from "@/lib/nutrition";

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function MacroTable({ macros }: { macros: Macros }) {
  const caloriesFromMacros = macros.carbs * 4 + macros.protein * 4 + macros.fats * 9;

  const rows = [
    { label: "Carbohydrates", value: macros.carbs, kcal: macros.carbs * 4, color: "bg-carb" },
    { label: "Protein", value: macros.protein, kcal: macros.protein * 4, color: "bg-protein" },
    { label: "Fats", value: macros.fats, kcal: macros.fats * 9, color: "bg-fat" },
  ];

  return (
    <section className="surface p-6" aria-label="Total macro table">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl">Total Macros on the Plate</h2>
        <span className="text-sm text-muted-foreground">{Math.round(macros.calories)} kcal</span>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {caloriesFromMacros > 0 ? (
          <div className="flex h-full w-full">
            {rows.map((r) => (
              <div
                key={r.label}
                className={r.color}
                style={{ width: `${pct(r.kcal, caloriesFromMacros)}%` }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <th className="pb-2 font-medium">Macro</th>
            <th className="pb-2 text-right font-medium">Grams</th>
            <th className="pb-2 text-right font-medium">Energy</th>
            <th className="pb-2 text-right font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border">
              <td className="py-3">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  {r.label}
                </span>
              </td>
              <td className="py-3 text-right font-display text-base tabular-nums">
                {r.value.toFixed(1)} g
              </td>
              <td className="py-3 text-right tabular-nums text-muted-foreground">
                {Math.round(r.kcal)} kcal
              </td>
              <td className="py-3 text-right tabular-nums text-muted-foreground">
                {pct(r.kcal, caloriesFromMacros)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
