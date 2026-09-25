/** Heuristic cooking assistant: parses user's dish description, flags unhealthy
 * choices, and suggests healthier ingredient alternatives with plate-sync. */

import { getIngredient, INGREDIENTS, type PlateItem, type Unit } from "./nutrition";
import { swapFor } from "./swaps";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** healthy ingredients to push to the plate */
  plateSync?: { ingredientId: string; amount: number }[];
};

export type CookingAdvice = {
  flags: string[];
  suggestions: string[];
  healthyPlate: { ingredientId: string; amount: number }[];
  summary: string;
};

/** Keyword map: unhealthy ingredient -> healthier alternative ingredient id */
const UNHEALTHY_PATTERNS: { match: string[]; flag: string; swapId?: string; alt: string; amount: number }[] = [
  { match: ["alfredo", "cream sauce", "heavy cream", "white sauce"], flag: "Heavy cream sauce", alt: "cottage-cheese", amount: 100, swapId: undefined },
  { match: ["white pasta", "regular pasta", "pasta"], flag: "Refined-flour pasta", swapId: "pasta-cooked", alt: "lentil-pasta-cooked", amount: 120 },
  { match: ["white rice", "rice"], flag: "White rice — high GI", swapId: "white-rice-cooked", alt: "basmati-rice-cooked", amount: 150 },
  { match: ["white bread", "bread"], flag: "White bread — fast spike", swapId: "white-bread", alt: "sourdough-bread", amount: 45 },
  { match: ["white flour", "maida", "refined flour"], flag: "Refined flour", swapId: "white-flour", alt: "almond-flour", amount: 40 },
  { match: ["sugar", "white sugar", "sugar"], flag: "Refined sugar", swapId: "white-sugar", alt: "monk-fruit-sweetener", amount: 10 },
  { match: ["fries", "french fries", "chips"], flag: "Deep-fried potato", swapId: "french-fries", alt: "sweet-potato", amount: 120 },
  { match: ["ice cream"], flag: "High-sugar dessert", swapId: "ice-cream", alt: "greek-yogurt-0pct", amount: 150 },
  { match: ["cola", "soda", "soft drink"], flag: "Sugary drink", swapId: "cola", alt: undefined, amount: 0 },
  { match: ["donut", "doughnut"], flag: "Fried refined sugar", swapId: "donut", alt: "oats-uncooked", amount: 40 },
  { match: ["deep fried", "fried chicken"], flag: "Deep-fried protein", alt: "chicken-breast", amount: 150 },
  { match: ["croissant", "pastry"], flag: "Refined flour + butter", alt: "sourdough-bread", amount: 45 },
];

/** Protein keywords to detect and recommend pairing */
const PROTEIN_KEYWORDS: { match: string[]; ingredientId: string; amount: number }[] = [
  { match: ["chicken"], ingredientId: "chicken-breast", amount: 150 },
  { match: ["salmon", "fish"], ingredientId: "salmon", amount: 140 },
  { match: ["egg", "eggs"], ingredientId: "eggs", amount: 100 },
  { match: ["tofu"], ingredientId: "tofu-firm", amount: 150 },
  { match: ["beef", "steak"], ingredientId: "lean-beef-steak", amount: 140 },
  { match: ["shrimp", "prawn"], ingredientId: "prawns", amount: 145 },
  { match: ["lentils", "dal"], ingredientId: "lentils-cooked", amount: 150 },
  { match: ["chickpea", "chana"], ingredientId: "chickpeas-cooked", amount: 120 },
];

const FIBER_KEYWORDS: { match: string[]; ingredientId: string; amount: number }[] = [
  { match: ["broccoli"], ingredientId: "broccoli", amount: 80 },
  { match: ["spinach", "greens"], ingredientId: "spinach", amount: 50 },
  { match: ["salad", "greens"], ingredientId: "romaine-lettuce", amount: 80 },
  { match: ["tomato"], ingredientId: "tomato", amount: 80 },
  { match: ["cucumber"], ingredientId: "cucumber", amount: 60 },
];

/** Healthy carb suggestions */
const CARB_ALTS: { match: string[]; ingredientId: string; amount: number }[] = [
  { match: ["rice"], ingredientId: "basmati-rice-cooked", amount: 120 },
  { match: ["pasta"], ingredientId: "lentil-pasta-cooked", amount: 120 },
  { match: ["bread", "sandwich", "wrap"], ingredientId: "sourdough-bread", amount: 45 },
  { match: ["potato"], ingredientId: "sweet-potato", amount: 120 },
];

export function analyzeDish(
  input: string,
  context: { pcosMode: boolean; goal: string | null; phase: string | null },
): CookingAdvice {
  const lower = input.toLowerCase();
  const flags: string[] = [];
  const suggestions: string[] = [];
  const healthyPlate: { ingredientId: string; amount: number }[] = [];
  const seen = new Set<string>();

  function addIngredient(id: string, amount: number) {
    if (seen.has(id)) return;
    seen.add(id);
    if (getIngredient(id).id !== "unknown") healthyPlate.push({ ingredientId: id, amount });
  }

  // Detect unhealthy patterns and swap
  for (const p of UNHEALTHY_PATTERNS) {
    if (p.match.some((m) => lower.includes(m))) {
      flags.push(p.flag);
      if (p.alt) {
        addIngredient(p.alt, p.amount);
        const swap = p.swapId ? swapFor(p.swapId) : undefined;
        suggestions.push(
          swap
            ? `${p.flag}: swap to ${getIngredient(p.alt).name} — ${swap.best.why}`
            : `${p.flag}: swap to ${getIngredient(p.alt).name} for a gentler glucose response.`,
        );
      } else {
        suggestions.push(`${p.flag}: skip it entirely or replace with sparkling water with lime.`);
      }
    }
  }

  // Detect protein — keep or add
  let foundProtein = false;
  for (const p of PROTEIN_KEYWORDS) {
    if (p.match.some((m) => lower.includes(m))) {
      addIngredient(p.ingredientId, p.amount);
      foundProtein = true;
      break;
    }
  }
  if (!foundProtein) {
    suggestions.push("No protein detected — add 120-150 g of chicken, fish, eggs, or tofu to stabilize your glucose.");
    addIngredient("chicken-breast", 150);
  }

  // Detect fiber — keep or add
  let foundFiber = false;
  for (const f of FIBER_KEYWORDS) {
    if (f.match.some((m) => lower.includes(m))) {
      addIngredient(f.ingredientId, f.amount);
      foundFiber = true;
      break;
    }
  }
  if (!foundFiber) {
    suggestions.push("Add a side of vegetables or greens — half the plate should be fiber.");
    addIngredient("broccoli", 80);
  }

  // Healthy carb
  let foundCarb = false;
  for (const c of CARB_ALTS) {
    if (c.match.some((m) => lower.includes(m))) {
      addIngredient(c.ingredientId, c.amount);
      foundCarb = true;
      break;
    }
  }
  if (!foundCarb && !flags.some((f) => f.includes("sugar") || f.includes("Sugary"))) {
    addIngredient("quinoa-cooked", 80);
  }

  // Context-aware advice
  if (context.pcosMode) {
    suggestions.unshift("PCOS mode: lead with protein, keep carbs complex, and add a 10-minute walk after this meal.");
  }
  if (context.goal === "body-comp") {
    suggestions.push("Body composition goal: make sure this plate hits 30+ g of protein.");
  }
  if (context.phase === "luteal") {
    suggestions.push("Luteal phase: cravings peak — protein first and add magnesium (pumpkin seeds or dark chocolate).");
  }

  const summary = flags.length === 0
    ? "This dish looks reasonably balanced! I've built a plate with the right macros for your goals."
    : `I spotted ${flags.length} ingredient${flags.length > 1 ? "s" : ""} that could spike your glucose. Here's a healthier version that keeps the flavour:`;

  return { flags, suggestions, healthyPlate, summary };
}

export function plateItemsFromAdvice(advice: CookingAdvice): PlateItem[] {
  return advice.healthyPlate.map((p) => ({
    key: `${p.ingredientId}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    ingredientId: p.ingredientId,
    amount: p.amount,
    unit: "g" as Unit,
  }));
}

export function generateResponse(advice: CookingAdvice): string {
  const parts = [advice.summary];
  if (advice.flags.length > 0) {
    parts.push("Flags: " + advice.flags.join(", "));
  }
  parts.push(...advice.suggestions);
  return parts.join("\n\n");
}

/** Find ingredient by fuzzy name search */
export function searchIngredient(query: string): string | null {
  const lower = query.toLowerCase().trim();
  if (!lower) return null;
  // exact id match
  const exact = INGREDIENTS.find((i) => i.id === lower);
  if (exact) return exact.id;
  // name includes
  const match = INGREDIENTS.find((i) => i.name.toLowerCase().includes(lower) || lower.includes(i.name.toLowerCase()));
  return match?.id ?? null;
}
