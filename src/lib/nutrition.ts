export type Unit = "g" | "cup";

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  /** grams in one standard cup measure */
  cupGrams: number;
  /** per 100 g */
  carbs: number;
  protein: number;
  fats: number;
  gi: number;
  note?: string;
};

export const INGREDIENTS: Ingredient[] = [
  { id: "avocado", name: "Avocado", category: "Fats", cupGrams: 150, carbs: 8.5, protein: 2, fats: 14.7, gi: 15 },
  { id: "chicken-breast", name: "Chicken Breast", category: "Protein", cupGrams: 140, carbs: 0, protein: 31, fats: 3.6, gi: 0 },
  { id: "white-rice", name: "White Rice (cooked)", category: "Carbs", cupGrams: 195, carbs: 28, protein: 2.7, fats: 0.3, gi: 73 },
  { id: "brown-rice", name: "Brown Rice (cooked)", category: "Carbs", cupGrams: 195, carbs: 23, protein: 2.6, fats: 0.9, gi: 50 },
  { id: "broccoli", name: "Broccoli", category: "Vegetables", cupGrams: 91, carbs: 7, protein: 2.8, fats: 0.4, gi: 15 },
  { id: "oats", name: "Oats (uncooked)", category: "Carbs", cupGrams: 80, carbs: 66, protein: 17, fats: 7, gi: 55 },
  { id: "eggs", name: "Eggs", category: "Protein", cupGrams: 243, carbs: 1.1, protein: 13, fats: 11, gi: 0, note: "1 large egg ≈ 50 g" },
  { id: "almonds", name: "Almonds", category: "Fats", cupGrams: 143, carbs: 22, protein: 21, fats: 50, gi: 15 },
  { id: "white-flour", name: "White Flour", category: "Carbs", cupGrams: 125, carbs: 76, protein: 10, fats: 1, gi: 85 },
  { id: "white-sugar", name: "White Sugar", category: "Sweeteners", cupGrams: 200, carbs: 100, protein: 0, fats: 0, gi: 65 },
  { id: "white-bread", name: "White Bread", category: "Carbs", cupGrams: 45, carbs: 49, protein: 9, fats: 3.2, gi: 75 },
  { id: "potato", name: "Potato (boiled)", category: "Carbs", cupGrams: 156, carbs: 20, protein: 2, fats: 0.1, gi: 78 },
  { id: "sweet-potato", name: "Sweet Potato", category: "Carbs", cupGrams: 133, carbs: 20, protein: 1.6, fats: 0.1, gi: 63 },
  { id: "quinoa", name: "Quinoa (cooked)", category: "Carbs", cupGrams: 185, carbs: 21, protein: 4.4, fats: 1.9, gi: 53 },
  { id: "lentils", name: "Lentils (cooked)", category: "Protein", cupGrams: 198, carbs: 20, protein: 9, fats: 0.4, gi: 32 },
  { id: "chickpeas", name: "Chickpeas (cooked)", category: "Protein", cupGrams: 164, carbs: 27, protein: 9, fats: 2.6, gi: 28 },
  { id: "greek-yogurt", name: "Greek Yogurt", category: "Protein", cupGrams: 245, carbs: 3.6, protein: 10, fats: 0.4, gi: 11 },
  { id: "salmon", name: "Salmon", category: "Protein", cupGrams: 154, carbs: 0, protein: 20, fats: 13, gi: 0 },
  { id: "tofu", name: "Tofu", category: "Protein", cupGrams: 252, carbs: 1.9, protein: 8, fats: 4.8, gi: 15 },
  { id: "spinach", name: "Spinach", category: "Vegetables", cupGrams: 30, carbs: 3.6, protein: 2.9, fats: 0.4, gi: 15 },
  { id: "banana", name: "Banana", category: "Fruit", cupGrams: 150, carbs: 23, protein: 1.1, fats: 0.3, gi: 51 },
  { id: "berries", name: "Mixed Berries", category: "Fruit", cupGrams: 148, carbs: 14, protein: 0.7, fats: 0.3, gi: 25 },
  { id: "olive-oil", name: "Olive Oil", category: "Fats", cupGrams: 216, carbs: 0, protein: 0, fats: 100, gi: 0 },
  { id: "almond-flour", name: "Almond Flour", category: "Carbs", cupGrams: 96, carbs: 21, protein: 21, fats: 50, gi: 1 },
  { id: "oat-flour", name: "Oat Flour", category: "Carbs", cupGrams: 120, carbs: 66, protein: 15, fats: 7, gi: 44 },
];

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
  "white-rice": {
    title: "White Rice",
    message: "Try Quinoa or Brown Rice — same comfort, a much gentler glucose curve.",
  },
  "white-bread": {
    title: "White Bread",
    message: "Reach for sourdough or sprouted-grain bread, or pair it with eggs and avocado to blunt the spike.",
  },
  potato: {
    title: "Potato",
    message: "Sweet potato or roasted chickpeas give you the same warmth with far steadier energy.",
  },
  banana: {
    title: "Ripe Banana",
    message: "Mixed berries deliver the sweetness with about half the sugar load.",
  },
};

export type PlateItem = {
  key: string;
  ingredientId: string;
  amount: number;
  unit: Unit;
};

export function getIngredient(id: string): Ingredient {
  const found = INGREDIENTS.find((i) => i.id === id);
  if (!found) throw new Error(`Unknown ingredient: ${id}`);
  return found;
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
] as const;
