/** Tiered ingredient swaps: best metabolic option, balanced option, and the original. */

export type SwapPriority = "health" | "balance" | "taste";

export type SwapOption = {
  name: string;
  health: number;
  taste: number;
  /** ingredient id to drop on the plate when chosen, when we have one */
  ingredientId?: string;
  why: string;
};

export type TieredSwap = {
  key: string;
  original: SwapOption;
  balanced: SwapOption;
  best: SwapOption;
};

/** keyed by ingredient id from the ingredient library */
export const TIERED_SWAPS: Record<string, TieredSwap> = {
  "white-flour": {
    key: "white-flour",
    original: { name: "Refined-flour roti / bread", health: 3, taste: 10, why: "Soft and familiar, but a fast glucose spike." },
    balanced: { name: "Whole-wheat roti", health: 7, taste: 8, ingredientId: "whole-wheat-flour", why: "Nearly the same texture with fibre that slows the spike." },
    best: { name: "Almond-flour roti", health: 9, taste: 5, ingredientId: "almond-flour", why: "Barely moves glucose; nutty and denser than you're used to." },
  },
  "white-rice-cooked": {
    key: "white-rice-cooked",
    original: { name: "White rice", health: 3, taste: 10, why: "Fluffy comfort food with a sharp glucose rise." },
    balanced: { name: "Basmati rice (cooled and reheated)", health: 7, taste: 9, ingredientId: "basmati-rice-cooked", why: "Lower GI grain, and cooling builds resistant starch." },
    best: { name: "Cauliflower rice with quinoa", health: 9, taste: 5, ingredientId: "quinoa-cooked", why: "Protein and fibre in place of most of the starch." },
  },
  "jasmine-rice-cooked": {
    key: "jasmine-rice-cooked",
    original: { name: "Jasmine rice", health: 3, taste: 10, why: "The highest-GI rice on the shelf." },
    balanced: { name: "Basmati rice", health: 7, taste: 9, ingredientId: "basmati-rice-cooked", why: "Same fluffiness, notably gentler curve." },
    best: { name: "Brown rice or quinoa", health: 9, taste: 5, ingredientId: "quinoa-cooked", why: "Fibre and protein flatten the response." },
  },
  "white-bread": {
    key: "white-bread",
    original: { name: "White bread", health: 3, taste: 10, why: "Light and soft; spikes like sugar." },
    balanced: { name: "Sourdough", health: 7, taste: 9, ingredientId: "sourdough-bread", why: "Fermentation lowers the glucose response and it still tastes like bread." },
    best: { name: "Sprouted-grain or seed bread", health: 9, taste: 6, ingredientId: "whole-wheat-bread", why: "Dense, high fibre, much steadier energy." },
  },
  "white-sugar": {
    key: "white-sugar",
    original: { name: "White sugar", health: 2, taste: 10, why: "Pure sweetness, pure spike." },
    balanced: { name: "Date paste or coconut sugar", health: 6, taste: 9, ingredientId: "dates", why: "Real sweetness with a little fibre and minerals." },
    best: { name: "Monk fruit or stevia", health: 9, taste: 6, ingredientId: "monk-fruit-sweetener", why: "Zero glucose impact; slight aftertaste." },
  },
  "brown-sugar": {
    key: "brown-sugar",
    original: { name: "Brown sugar", health: 3, taste: 10, why: "Caramel depth, same glucose hit as white." },
    balanced: { name: "Coconut sugar", health: 6, taste: 9, ingredientId: "coconut-sugar", why: "Similar flavour, slightly lower GI." },
    best: { name: "Monk fruit blend", health: 9, taste: 6, ingredientId: "monk-fruit-sweetener", why: "No spike at all." },
  },
  honey: {
    key: "honey",
    original: { name: "Honey", health: 5, taste: 10, why: "Lovely, but still concentrated sugar." },
    balanced: { name: "Blended dates", health: 7, taste: 8, ingredientId: "dates", why: "Fibre travels with the sugar." },
    best: { name: "Monk fruit syrup", health: 9, taste: 6, ingredientId: "monk-fruit-sweetener", why: "Sweetness without the load." },
  },
  "potato-boiled": {
    key: "potato-boiled",
    original: { name: "Boiled potato", health: 4, taste: 10, why: "Comforting starch with a quick rise." },
    balanced: { name: "Sweet potato", health: 7, taste: 9, ingredientId: "sweet-potato", why: "Same warmth, more fibre and beta-carotene." },
    best: { name: "Roasted chickpeas or cauliflower mash", health: 9, taste: 5, ingredientId: "chickpeas-cooked", why: "Protein and fibre instead of starch." },
  },
  "french-fries": {
    key: "french-fries",
    original: { name: "French fries", health: 2, taste: 10, why: "Refined oil plus fast starch." },
    balanced: { name: "Air-fried sweet potato wedges", health: 7, taste: 9, ingredientId: "sweet-potato", why: "Same crunch, real fibre, far less oil." },
    best: { name: "Crispy roasted chickpeas", health: 9, taste: 5, ingredientId: "chickpeas-cooked", why: "Salty crunch with 8 g protein a serve." },
  },
  "potato-chips": {
    key: "potato-chips",
    original: { name: "Potato chips", health: 2, taste: 10, why: "Salt and crunch, nothing else." },
    balanced: { name: "Lightly salted popcorn", health: 6, taste: 8, ingredientId: "popcorn", why: "Whole grain, much lighter." },
    best: { name: "Roasted edamame", health: 9, taste: 5, ingredientId: "edamame", why: "18 g protein per bowl with the same squeak." },
  },
  "ice-cream": {
    key: "ice-cream",
    original: { name: "Ice cream", health: 2, taste: 10, why: "Sugar and cream in one spoon." },
    balanced: { name: "Greek yogurt with berries, frozen", health: 7, taste: 8, ingredientId: "greek-yogurt", why: "Creamy and cold with real protein." },
    best: { name: "Protein berry nice-cream", health: 9, taste: 6, ingredientId: "greek-yogurt", why: "20 g protein, no spike." },
  },
  "orange-juice": {
    key: "orange-juice",
    original: { name: "Orange juice", health: 3, taste: 10, why: "Sugar with the fibre removed." },
    balanced: { name: "A whole orange", health: 8, taste: 8, ingredientId: "orange", why: "The fibre slows everything down." },
    best: { name: "Sparkling water with citrus", health: 9, taste: 5, why: "Refreshment with zero sugar." },
  },
  cola: {
    key: "cola",
    original: { name: "Cola", health: 1, taste: 10, why: "About 35 g of sugar a can." },
    balanced: { name: "Kombucha", health: 7, taste: 8, why: "Fizz and tang, a fraction of the sugar." },
    best: { name: "Sparkling water with lime", health: 10, taste: 5, why: "All the fizz, none of the sugar." },
  },
  granola: {
    key: "granola",
    original: { name: "Granola", health: 3, taste: 10, why: "Usually dessert wearing a breakfast label." },
    balanced: { name: "Oats with nuts and seeds", health: 7, taste: 8, ingredientId: "oats-rolled", why: "Same crunch with far less sugar." },
    best: { name: "Greek yogurt with nuts and berries", health: 9, taste: 6, ingredientId: "greek-yogurt", why: "Protein-led breakfast, flat curve." },
  },
  donut: {
    key: "donut",
    original: { name: "Donut", health: 1, taste: 10, why: "Fried refined flour and sugar." },
    balanced: { name: "Baked oat-flour muffin", health: 6, taste: 8, ingredientId: "oat-flour", why: "Baked rather than fried, some fibre." },
    best: { name: "Almond-flour baked donut", health: 9, taste: 6, ingredientId: "almond-flour", why: "Low carb with 8 g protein each." },
  },
  bagel: {
    key: "bagel",
    original: { name: "Bagel", health: 3, taste: 10, why: "Roughly four slices of white bread." },
    balanced: { name: "Sourdough slice", health: 7, taste: 8, ingredientId: "sourdough-bread", why: "Chewy and familiar, gentler curve." },
    best: { name: "Egg and cottage-cheese base", health: 9, taste: 5, ingredientId: "cottage-cheese", why: "Triples the protein, no spike." },
  },
  "rice-cakes": {
    key: "rice-cakes",
    original: { name: "Rice cakes", health: 3, taste: 9, why: "Puffed starch — a surprisingly high GI." },
    balanced: { name: "Oat crackers", health: 6, taste: 8, why: "More fibre, slower release." },
    best: { name: "Cucumber rounds with cottage cheese", health: 9, taste: 5, ingredientId: "cottage-cheese", why: "Crunch with protein and water." },
  },
  banana: {
    key: "banana",
    original: { name: "Ripe banana", health: 5, taste: 10, why: "Sweet and quick — especially when very ripe." },
    balanced: { name: "Green-tipped banana with nut butter", health: 7, taste: 9, ingredientId: "peanut-butter", why: "Resistant starch plus fat slows it right down." },
    best: { name: "Mixed berries", health: 9, taste: 6, ingredientId: "blueberries", why: "Half the sugar, more antioxidants." },
  },
  "pasta-cooked": {
    key: "pasta-cooked",
    original: { name: "White pasta", health: 4, taste: 10, why: "Comfort carbs with little fibre." },
    balanced: { name: "Wholewheat pasta, al dente", health: 7, taste: 8, ingredientId: "whole-wheat-pasta-cooked", why: "Fibre plus firmer cooking lowers the GI." },
    best: { name: "Lentil or chickpea pasta", health: 9, taste: 6, ingredientId: "lentil-pasta-cooked", why: "Triple the protein and fibre." },
  },
};

export function swapFor(ingredientId: string): TieredSwap | undefined {
  return TIERED_SWAPS[ingredientId];
}

export function resolveByPriority(swap: TieredSwap, priority: SwapPriority): SwapOption {
  if (priority === "health") return swap.best;
  if (priority === "taste") return swap.balanced;
  // balance: whichever option has the best combined score
  return swap.best.health + swap.best.taste >= swap.balanced.health + swap.balanced.taste
    ? swap.best
    : swap.balanced;
}

export const PRIORITY_LABELS: { id: SwapPriority; label: string }[] = [
  { id: "health", label: "🫀 Maximum health" },
  { id: "balance", label: "⚖️ Balance" },
  { id: "taste", label: "😋 Closest to original taste" },
];
