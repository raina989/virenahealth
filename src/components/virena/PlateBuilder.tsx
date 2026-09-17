import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  INGREDIENTS,
  getIngredient,
  isHighGI,
  itemMacros,
  toGrams,
  type PlateItem,
  type Unit,
} from "@/lib/nutrition";

type Props = {
  items: PlateItem[];
  onChange: (items: PlateItem[]) => void;
  pcosMode: boolean;
};

export function PlateBuilder({ items, onChange, pcosMode }: Props) {
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof INGREDIENTS>();
    for (const ing of INGREDIENTS) {
      const list = map.get(ing.category) ?? [];
      list.push(ing);
      map.set(ing.category, list);
    }
    return [...map.entries()];
  }, []);

  function addIngredient(id: string) {
    setOpen(false);
    onChange([
      ...items,
      { key: `${id}-${Date.now()}-${Math.round(Math.random() * 1e6)}`, ingredientId: id, amount: 100, unit: "g" },
    ]);
  }

  function update(key: string, patch: Partial<PlateItem>) {
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function switchUnit(item: PlateItem, unit: Unit) {
    if (unit === item.unit) return;
    const ing = getIngredient(item.ingredientId);
    const grams = toGrams(item);
    const amount = unit === "cup" ? Number((grams / ing.cupGrams).toFixed(2)) : Math.round(grams);
    update(item.key, { unit, amount });
  }

  return (
    <section className="surface p-6" aria-label="Plate builder">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Build your plate</h2>
          <p className="text-sm text-muted-foreground">
            Search an ingredient, then log it in grams or cups — conversions happen instantly.
          </p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="default" role="combobox" aria-expanded={open}>
              <Plus className="mr-1 h-4 w-4" /> Add ingredient
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[19rem] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search ingredients…" />
              <CommandList>
                <CommandEmpty>No ingredient found.</CommandEmpty>
                {grouped.map(([category, list]) => (
                  <CommandGroup key={category} heading={category}>
                    {list.map((ing) => (
                      <CommandItem key={ing.id} value={ing.name} onSelect={() => addIngredient(ing.id)}>
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        <span className="flex-1">{ing.name}</span>
                        {isHighGI(ing.id) ? (
                          <Badge variant="destructive" className="ml-2">
                            GI {ing.gi}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">GI {ing.gi}</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <ul className="mt-6 space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border bg-muted/40 px-5 py-10 text-center text-sm text-muted-foreground">
            Your plate is empty. Add your first ingredient to see live macros and your glucose curve.
          </li>
        ) : null}

        {items.map((item) => {
          const ing = getIngredient(item.ingredientId);
          const m = itemMacros(item);
          const high = isHighGI(ing.id);
          return (
            <li
              key={item.key}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
            >
              <div className="min-w-[10rem] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{ing.name}</span>
                  {high && pcosMode ? (
                    <Badge variant="destructive">High-GI · {ing.gi} · insulin trigger</Badge>
                  ) : high ? (
                    <Badge variant="destructive">High-GI {ing.gi}</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(toGrams(item))} g · {m.carbs.toFixed(1)}C / {m.protein.toFixed(1)}P /{" "}
                  {m.fats.toFixed(1)}F · 1 cup = {ing.cupGrams} g
                </p>
              </div>

              <Input
                type="number"
                min={0}
                step={item.unit === "cup" ? 0.25 : 5}
                value={item.amount}
                onChange={(e) => update(item.key, { amount: Number(e.target.value) })}
                className="w-24 bg-background"
                aria-label={`Portion for ${ing.name}`}
              />

              <div className="inline-flex rounded-full border border-border bg-background p-0.5">
                {(["g", "cup"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => switchUnit(item, u)}
                    aria-pressed={item.unit === u}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      item.unit === u
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {u === "g" ? "grams" : "cups"}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(items.filter((i) => i.key !== item.key))}
                aria-label={`Remove ${ing.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
