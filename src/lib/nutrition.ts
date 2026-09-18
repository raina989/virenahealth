import { INGREDIENTS, CATEGORY_ORDER, type Ingredient } from "./ingredients";

export type Unit = "g" | "cup";
export type { Ingredient };
export { INGREDIENTS, CATEGORY_ORDER };

export const HIGH_GI_THRESHOLD = 60;

export const SWAPS: Record<string, { title: string; message: string }> = {
  "white-flour": {
    title: "White Flour",
    message: "Try Almond Flour or Oat Flour for a blood-sugar-friendly, delicious alternative!",
  },
  "white-sugar": {
    title: "White Sugar",
    message: "Swap for Stevia Drops or Monkfruit Sweetener to keep it sweet without the glucose spike!",
  },
  "brown-sugar": {
    title: "Brown Sugar",
    message: "Coconut sugar or date syrup land softer — or use monk fruit for a zero-spike swap.",
  },
  "white-rice-cooked": {
    title: "White Rice",
    message: "Try Quinoa or Brown Rice — same comfort, a much gentler glucose curve.",
  },
  "jasmine-rice-cooked": {
    title: "Jasmine Rice",
    message: "Basmati or brown rice gives the same fluffiness with a far lower glucose response.",
  },
  "white-bread": {
    title: "White Bread",
    message: "Reach for sourdough or sprouted-grain bread, or pair it with eggs and avocado to blunt the spike.",
  },
  bagel: {
    title: "Bagel",
    message: "Half a sourdough slice with cottage cheese and egg keeps the chew and triples the protein.",
  },
  "potato-boiled": {
    title: "Potato",
    message: "Sweet potato or roasted chickpeas give you the same warmth with far steadier energy.",
  },
  "french-fries": {
    title: "French Fries",
    message: "Air-fried sweet potato wedges or crispy chickpeas hit the same craving with real fibre.",
  },
  banana: {
    title: "Ripe Banana",
    message: "Mixed berries deliver the sweetness with about half the sugar load.",
  },
  "orange-juice": {
    title: "Orange Juice",
    message: "Eat the whole orange instead — the fibre slows the sugar right down.",
  },
  cola: {
    title: "Cola",
    message: "Try sparkling water with lime, or kombucha, for fizz without the glucose hit.",
  },
  "potato-chips": {
    title: "Potato Chips",
    message: "Air-fried chickpeas or roasted edamame give the crunch plus protein and fibre.",
  },
  "ice-cream": {
    title: "Ice Cream",
    message: "Blend frozen berries with Greek yogurt for a protein-rich, spike-free scoop.",
  },
  "rice-cakes": {
    title: "Rice Cakes",
    message: "Top them with nut butter or cottage cheese, or switch to oat crackers, to slow the spike.",
  },
  granola: {
    title: "Granola",
    message: "Swap for nuts, seeds and Greek yogurt — same crunch, far less sugar.",
  },
  honey: {
    title: "Honey",
    message: "Lovely in small amounts — for a zero-spike option, use monk fruit or a couple of dates blended in.",
  },
  donut: {
    title: "Donut",
    message: "A Greek yogurt + almond flour baked donut keeps the treat and adds 15 g of protein.",
  },
};

export type PlateItem = {
  key: string;
  ingredientId: string;
  amount: number;
  unit: Unit;
};

const BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

const UNKNOWN: Ingredient = {
  id: "unknown",
  name: "Unknown ingredient",
  category: "Other",
  cupGrams: 100,
  carbs: 0,
  protein: 0,
  fats: 0,
  gi: 0,
};

/** Never throws: older logs may reference ingredients that have since been renamed. */
export function getIngredient(id: string): Ingredient {
  return BY_ID.get(id) ?? { ...UNKNOWN, id, name: prettify(id) };
}

function prettify(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Converts a portion to grams, handling cup -> gram conversion per ingredient. */
export function toGrams(item: PlateItem): number {
  const ing = getIngredient(item.ingredientId);
  const amount = Number.isFinite(item.amount) ? item.amount : 0;
  return item.unit === "cup" ? amount * ing.cupGrams : amount;
}

export type Macros = { carbs: number; protein: number; fats: number; calories: number };

export function itemMacros(item: PlateItem): Macros {
  const ing = getIngredient(item.ingredientId);
  const f = toGrams(item) / 100;
  const carbs = ing.carbs * f;
  const protein = ing.protein * f;
  const fats = ing.fats * f;
  return { carbs, protein, fats, calories: carbs * 4 + protein * 4 + fats * 9 };
}

export function totalMacros(items: PlateItem[]): Macros {
  return items.reduce<Macros>(
    (acc, item) => {
      const m = itemMacros(item);
      return {
        carbs: acc.carbs + m.carbs,
        protein: acc.protein + m.protein,
        fats: acc.fats + m.fats,
        calories: acc.calories + m.calories,
      };
    },
    { carbs: 0, protein: 0, fats: 0, calories: 0 },
  );
}

/** Weighted glycemic load of the plate (GI x available carbs / 100). */
export function glycemicLoad(items: PlateItem[]): number {
  return items.reduce((sum, item) => {
    const ing = getIngredient(item.ingredientId);
    const carbs = itemMacros(item).carbs;
    return sum + (ing.gi * carbs) / 100;
  }, 0);
}

export function isHighGI(id: string): boolean {
  return getIngredient(id).gi >= HIGH_GI_THRESHOLD;
}

/**
 * Estimated glucose response curve (mg/dL above fasting) over 180 minutes.
 * Protein and fat slow absorption: they lower the peak and push it later.
 */
export function glucoseCurve(items: PlateItem[], insulinSensitive: boolean): { t: number; v: number }[] {
  const { protein, fats } = totalMacros(items);
  const gl = glycemicLoad(items);
  const buffer = 1 / (1 + (protein * 0.012 + fats * 0.009));
  const sensitivityFactor = insulinSensitive ? 1.25 : 1;
  const peak = Math.min(95, gl * 1.65 * buffer * sensitivityFactor);
  const peakTime = 42 + (1 - buffer) * 40;
  const spread = 34 + (1 - buffer) * 26;

  return Array.from({ length: 37 }, (_, i) => {
    const t = i * 5;
    const v = peak * Math.exp(-Math.pow(t - peakTime, 2) / (2 * spread * spread));
    return { t, v: Math.max(0, v) };
  });
}

export type Guardrail = { level: "ok" | "warn"; title: string; message: string };

export function evaluateGuardrail(items: PlateItem[], pcosMode: boolean): Guardrail | null {
  if (items.length === 0) return null;
  const { carbs, protein } = totalMacros(items);
  if (carbs < 25) return null;

  const ratio = protein / carbs;
  if (ratio < 0.35) {
    return {
      level: "warn",
      title: pcosMode ? "Insulin-sensitivity check" : "Let's optimize this plate!",
      message: pcosMode
        ? "Let's optimize this plate! To stabilize your glucose levels and maintain energy, consider increasing your protein portion and lowering the carbohydrates slightly. With PCOS, a protein-forward plate is one of the strongest levers for insulin sensitivity."
        : "Let's optimize this plate! To stabilize your glucose levels and maintain energy, consider increasing your protein portion and lowering the carbohydrates slightly.",
    };
  }
  return {
    level: "ok",
    title: "Beautifully balanced",
    message: "Your protein is holding this plate steady — expect a gentle, even glucose curve.",
  };
}

export const CYCLE_PHASES = [
  {
    id: "menstrual",
    label: "Menstrual",
    days: "Days 1–5",
    focus: "Iron-rich foods, warm meals, magnesium. Keep carbs slow and paired with protein.",
  },
  {
    id: "follicular",
    label: "Follicular",
    days: "Days 6–13",
    focus: "Energy is rising — lean protein, fermented foods and leafy greens work beautifully.",
  },
  {
    id: "ovulatory",
    label: "Ovulatory",
    days: "Days 14–16",
    focus: "Peak insulin sensitivity. Fibre, cruciferous veg and antioxidants shine here.",
  },
  {
    id: "luteal",
    label: "Luteal",
    days: "Days 17–28",
    focus: "Cravings peak and insulin sensitivity dips — protein first, sugar last.",
  },
] as const;

export const SYMPTOMS = [
  "Fatigue",
  "Sugar cravings",
  "Bloating",
  "Acne",
  "Mood swings",
  "Hair shedding",
  "Anxiety",
  "Poor sleep",
  "Headache",
  "Cramping",
  "Brain fog",
  "Joint aches",
  "Low mood",
  "Nausea",
] as const;

export const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];
