/** Cuisine-based meal idea templates with phase/goal adaptation. */

export type Cuisine = {
  id: string;
  label: string;
  emoji: string;
  imageQuery: string;
};

export type MealIdeaSlot = "Breakfast" | "Lunch" | "Dinner";

export type MealLine = {
  label: string;
  value: string;
};

export type MealIdea = {
  id: string;
  title: string;
  slot: MealIdeaSlot;
  lines: MealLine[];
  /** ingredient ids + amounts (g) to sync to the plate */
  plate: { ingredientId: string; amount: number }[];
  imageQuery: string;
};

export type MealTemplate = Omit<MealIdea, "id">;

export const CUISINES: Cuisine[] = [
  { id: "south-asian", label: "South Asian", emoji: "🍛", imageQuery: "indian food thali" },
  { id: "middle-eastern", label: "Middle Eastern", emoji: "🥙", imageQuery: "middle eastern food meze" },
  { id: "east-asian", label: "East Asian", emoji: "🥢", imageQuery: "asian food bowl" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫒", imageQuery: "mediterranean food plate" },
  { id: "italian", label: "Italian", emoji: "🍝", imageQuery: "italian food pasta" },
  { id: "latin", label: "Latin American", emoji: "🌮", imageQuery: "latin american food tacos" },
  { id: "comfort", label: "Comfort food", emoji: "🍖", imageQuery: "comfort food home cooked" },
  { id: "light", label: "Light & fresh", emoji: "🥗", imageQuery: "fresh healthy salad bowl" },
];

const TEMPLATES: Record<string, MealTemplate[]> = {
  "south-asian": [
    {
      title: "Grilled chicken tandoori bowl",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 medium bowl" },
        { label: "Protein", value: "Add 150 g grilled chicken" },
        { label: "Fiber", value: "Add a cucumber-tomato kachumber" },
        { label: "Rice/Carb", value: "Swap to 3/4 cup basmati" },
        { label: "Side", value: "Greek yogurt raita" },
        { label: "Drink", value: "Mint lime soda (no sugar)" },
      ],
      plate: [
        { ingredientId: "chicken-breast", amount: 150 },
        { ingredientId: "cucumber", amount: 80 },
        { ingredientId: "tomato", amount: 60 },
        { ingredientId: "basmati-rice-cooked", amount: 150 },
        { ingredientId: "greek-yogurt-0pct", amount: 100 },
      ],
      imageQuery: "tandoori chicken bowl indian",
    },
    {
      title: "Moong dal chilla with paneer",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "2 small savoury pancakes" },
        { label: "Protein", value: "Add 80 g paneer filling" },
        { label: "Fiber", value: "Add mint-coriander chutney" },
        { label: "Rice/Carb", value: "No rice — lentil-based chilla" },
        { label: "Side", value: "Small bowl of curd" },
        { label: "Drink", value: "Ginger green tea" },
      ],
      plate: [
        { ingredientId: "mung-beans-cooked", amount: 120 },
        { ingredientId: "paneer", amount: 80 },
        { ingredientId: "spinach", amount: 30 },
        { ingredientId: "curd-dahi", amount: 80 },
      ],
      imageQuery: "moong dal chilla indian breakfast",
    },
    {
      title: "Lemon rice with chickpea curry",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 plate" },
        { label: "Protein", value: "Add 120 g chana masala" },
        { label: "Fiber", value: "Add steamed greens" },
        { label: "Rice/Carb", value: "1/2 cup brown rice" },
        { label: "Side", value: "Cucumber raita" },
        { label: "Drink", value: "Warm turmeric milk" },
      ],
      plate: [
        { ingredientId: "chickpeas-cooked", amount: 120 },
        { ingredientId: "brown-rice-cooked", amount: 100 },
        { ingredientId: "spinach", amount: 50 },
        { ingredientId: "greek-yogurt-0pct", amount: 80 },
      ],
      imageQuery: "lemon rice chickpea curry indian",
    },
  ],
  "middle-eastern": [
    {
      title: "Shawarma chicken with fattoush",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 wrap + salad" },
        { label: "Protein", value: "Add 150 g shawarma chicken" },
        { label: "Fiber", value: "Add fattoush salad" },
        { label: "Rice/Carb", value: "Whole-wheat wrap or skip" },
        { label: "Side", value: "Hummus, 2 tbsp" },
        { label: "Drink", value: "Sparkling water with mint" },
      ],
      plate: [
        { ingredientId: "shawarma-chicken", amount: 150 },
        { ingredientId: "fattoush", amount: 120 },
        { ingredientId: "hummus", amount: 60 },
        { ingredientId: "whole-wheat-tortilla", amount: 60 },
      ],
      imageQuery: "shawarma chicken fattoush salad",
    },
    {
      title: "Shakshuka with labneh",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "1 skillet" },
        { label: "Protein", value: "Add 2 eggs" },
        { label: "Fiber", value: "Add tomato-passata base" },
        { label: "Rice/Carb", value: "1 small slice sourdough" },
        { label: "Side", value: "Labneh, 2 tbsp" },
        { label: "Drink", value: "Black coffee or herbal tea" },
      ],
      plate: [
        { ingredientId: "eggs", amount: 100 },
        { ingredientId: "tomato-passata", amount: 150 },
        { ingredientId: "sourdough-bread", amount: 45 },
        { ingredientId: "labneh", amount: 60 },
      ],
      imageQuery: "shakshuka middle eastern breakfast",
    },
    {
      title: "Mujadara with grilled halloumi",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 100 g grilled halloumi" },
        { label: "Fiber", value: "Add cabbage slaw" },
        { label: "Rice/Carb", value: "Lentil-rice mujadara, 3/4 cup" },
        { label: "Side", value: "Tahini drizzle" },
        { label: "Drink", value: "Mint tea" },
      ],
      plate: [
        { ingredientId: "mujadara", amount: 150 },
        { ingredientId: "halloumi", amount: 100 },
        { ingredientId: "cabbage", amount: 60 },
        { ingredientId: "tahini", amount: 20 },
      ],
      imageQuery: "mujadara halloumi middle eastern dinner",
    },
  ],
  "east-asian": [
    {
      title: "Salmon teriyaki with edamame",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 plate" },
        { label: "Protein", value: "Add 140 g salmon" },
        { label: "Fiber", value: "Add steamed bok choy" },
        { label: "Rice/Carb", value: "1/2 cup brown rice" },
        { label: "Side", value: "Edamame, 1/2 cup" },
        { label: "Drink", value: "Green tea" },
      ],
      plate: [
        { ingredientId: "salmon", amount: 140 },
        { ingredientId: "bok-choy", amount: 80 },
        { ingredientId: "brown-rice-cooked", amount: 100 },
        { ingredientId: "edamame", amount: 80 },
      ],
      imageQuery: "salmon teriyaki edamame asian",
    },
    {
      title: "Tofu stir-fry with soba",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 150 g firm tofu" },
        { label: "Fiber", value: "Add stir-fried vegetables" },
        { label: "Rice/Carb", value: "Soba noodles, 3/4 cup" },
        { label: "Side", value: "Kimchi" },
        { label: "Drink", value: "Miso soup" },
      ],
      plate: [
        { ingredientId: "tofu-firm", amount: 150 },
        { ingredientId: "stir-fried-vegetables", amount: 120 },
        { ingredientId: "soba-noodles-cooked", amount: 120 },
        { ingredientId: "kimchi", amount: 50 },
      ],
      imageQuery: "tofu stir fry soba noodles asian",
    },
    {
      title: "Matcha overnight oats",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "1 jar" },
        { label: "Protein", value: "Add 1 scoop whey or 100 g skyr" },
        { label: "Fiber", value: "Add chia seeds & berries" },
        { label: "Rice/Carb", value: "1/2 cup oats" },
        { label: "Side", value: "Almond butter, 1 tsp" },
        { label: "Drink", value: "Matcha tea" },
      ],
      plate: [
        { ingredientId: "oats-uncooked", amount: 40 },
        { ingredientId: "skyr", amount: 100 },
        { ingredientId: "chia-seeds", amount: 15 },
        { ingredientId: "mixed-berries", amount: 80 },
        { ingredientId: "almond-butter", amount: 15 },
      ],
      imageQuery: "matcha overnight oats asian breakfast",
    },
  ],
  mediterranean: [
    {
      title: "Grilled sea bass with ratatouille",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 plate" },
        { label: "Protein", value: "Add 160 g sea bass" },
        { label: "Fiber", value: "Add ratatouille" },
        { label: "Rice/Carb", value: "1/3 cup quinoa" },
        { label: "Side", value: "Greek salad" },
        { label: "Drink", value: "Sparkling water with lemon" },
      ],
      plate: [
        { ingredientId: "sea-bass", amount: 160 },
        { ingredientId: "ratatouille", amount: 150 },
        { ingredientId: "quinoa-cooked", amount: 80 },
        { ingredientId: "greek-salad", amount: 100 },
      ],
      imageQuery: "grilled sea bass ratatouille mediterranean",
    },
    {
      title: "Caprese with grilled chicken",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 120 g grilled chicken" },
        { label: "Fiber", value: "Add rocket & tomato" },
        { label: "Rice/Carb", value: "No heavy carb" },
        { label: "Side", value: "Mozzarella, 60 g" },
        { label: "Drink", value: "Iced herbal tea" },
      ],
      plate: [
        { ingredientId: "chicken-breast", amount: 120 },
        { ingredientId: "rocket-arugula", amount: 60 },
        { ingredientId: "tomato", amount: 80 },
        { ingredientId: "mozzarella", amount: 60 },
      ],
      imageQuery: "caprese grilled chicken mediterranean",
    },
    {
      title: "Greek yogurt with walnuts & honey",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 150 g Greek yogurt" },
        { label: "Fiber", value: "Add berries" },
        { label: "Rice/Carb", value: "No refined carb" },
        { label: "Side", value: "Walnuts, 6 halves" },
        { label: "Drink", value: "Green tea" },
      ],
      plate: [
        { ingredientId: "greek-yogurt-0pct", amount: 150 },
        { ingredientId: "mixed-berries", amount: 80 },
        { ingredientId: "walnuts", amount: 30 },
      ],
      imageQuery: "greek yogurt walnuts honey mediterranean",
    },
  ],
  italian: [
    {
      title: "Lentil pasta with cottage-cheese alfredo",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 120 g grilled chicken" },
        { label: "Fiber", value: "Add spinach" },
        { label: "Rice/Carb", value: "Lentil pasta, 3/4 cup" },
        { label: "Side", value: "Cottage cheese sauce" },
        { label: "Drink", value: "Sparkling water" },
      ],
      plate: [
        { ingredientId: "lentil-pasta-cooked", amount: 120 },
        { ingredientId: "chicken-breast", amount: 120 },
        { ingredientId: "spinach", amount: 60 },
        { ingredientId: "cottage-cheese", amount: 100 },
      ],
      imageQuery: "lentil pasta alfredo italian healthy",
    },
    {
      title: "Prosciutto egg muffins",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "2 muffins" },
        { label: "Protein", value: "Add 2 eggs" },
        { label: "Fiber", value: "Add cherry tomatoes" },
        { label: "Rice/Carb", value: "No refined carb" },
        { label: "Side", value: "Prosciutto, 2 slices" },
        { label: "Drink", value: "Espresso" },
      ],
      plate: [
        { ingredientId: "eggs", amount: 100 },
        { ingredientId: "cherry-tomatoes", amount: 60 },
        { ingredientId: "ham-lean", amount: 40 },
      ],
      imageQuery: "prosciutto egg muffins italian breakfast",
    },
    {
      title: "Chicken caprese sourdough",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 open sandwich" },
        { label: "Protein", value: "Add 120 g grilled chicken" },
        { label: "Fiber", value: "Add rocket & tomato" },
        { label: "Rice/Carb", value: "1 slice sourdough" },
        { label: "Side", value: "Mozzarella, 50 g" },
        { label: "Drink", value: "Sparkling water with lime" },
      ],
      plate: [
        { ingredientId: "chicken-breast", amount: 120 },
        { ingredientId: "sourdough-bread", amount: 45 },
        { ingredientId: "rocket-arugula", amount: 50 },
        { ingredientId: "mozzarella", amount: 50 },
      ],
      imageQuery: "chicken caprese sourdough italian",
    },
  ],
  latin: [
    {
      title: "Black bean taco bowl",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 120 g grilled chicken" },
        { label: "Fiber", value: "Add black beans & salsa" },
        { label: "Rice/Carb", value: "1/3 cup brown rice" },
        { label: "Side", value: "Guacamole, 2 tbsp" },
        { label: "Drink", value: "Sparkling water with lime" },
      ],
      plate: [
        { ingredientId: "chicken-breast", amount: 120 },
        { ingredientId: "black-beans-cooked", amount: 100 },
        { ingredientId: "brown-rice-cooked", amount: 80 },
        { ingredientId: "guacamole", amount: 60 },
        { ingredientId: "salsa", amount: 50 },
      ],
      imageQuery: "black bean taco bowl latin",
    },
    {
      title: "Ceviche with quinoa",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 150 g ceviche" },
        { label: "Fiber", value: "Add avocado & red onion" },
        { label: "Rice/Carb", value: "1/3 cup quinoa" },
        { label: "Side", value: "Lime & cilantro" },
        { label: "Drink", value: "Sparkling water" },
      ],
      plate: [
        { ingredientId: "ceviche", amount: 150 },
        { ingredientId: "avocado", amount: 60 },
        { ingredientId: "quinoa-cooked", amount: 80 },
        { ingredientId: "red-onion", amount: 30 },
      ],
      imageQuery: "ceviche quinoa latin american",
    },
    {
      title: "Arepa with eggs and avocado",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "1 arepa, halved" },
        { label: "Protein", value: "Add 2 eggs" },
        { label: "Fiber", value: "Add avocado slices" },
        { label: "Rice/Carb", value: "1 small arepa" },
        { label: "Side", value: "Black beans, 1/3 cup" },
        { label: "Drink", value: "Black coffee" },
      ],
      plate: [
        { ingredientId: "eggs", amount: 100 },
        { ingredientId: "avocado", amount: 60 },
        { ingredientId: "arepa", amount: 100 },
        { ingredientId: "black-beans-cooked", amount: 80 },
      ],
      imageQuery: "arepa eggs avocado latin breakfast",
    },
  ],
  comfort: [
    {
      title: "Protein mac & cheese",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 120 g chicken + cottage cheese sauce" },
        { label: "Fiber", value: "Add broccoli" },
        { label: "Rice/Carb", value: "Chickpea pasta, 3/4 cup" },
        { label: "Side", value: "Side salad" },
        { label: "Drink", value: "Sparkling water" },
      ],
      plate: [
        { ingredientId: "chickpea-pasta-cooked", amount: 120 },
        { ingredientId: "chicken-breast", amount: 120 },
        { ingredientId: "broccoli", amount: 80 },
        { ingredientId: "cottage-cheese", amount: 100 },
      ],
      imageQuery: "protein mac and cheese comfort food",
    },
    {
      title: "Big breakfast scramble",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "1 large plate" },
        { label: "Protein", value: "Add 3 eggs" },
        { label: "Fiber", value: "Add spinach & tomato" },
        { label: "Rice/Carb", value: "1 slice sourdough" },
        { label: "Side", value: "Avocado, 1/4" },
        { label: "Drink", value: "Black coffee" },
      ],
      plate: [
        { ingredientId: "eggs", amount: 150 },
        { ingredientId: "spinach", amount: 50 },
        { ingredientId: "tomato", amount: 60 },
        { ingredientId: "sourdough-bread", amount: 45 },
        { ingredientId: "avocado", amount: 40 },
      ],
      imageQuery: "big breakfast scramble comfort food",
    },
    {
      title: "Chicken burger (no bun) with sweet potato fries",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 plate" },
        { label: "Protein", value: "Add 150 g chicken patty" },
        { label: "Fiber", value: "Add side salad" },
        { label: "Rice/Carb", value: "Sweet potato wedges" },
        { label: "Side", value: "Greek yogurt dip" },
        { label: "Drink", value: "Sparkling water with lime" },
      ],
      plate: [
        { ingredientId: "chicken-mince", amount: 150 },
        { ingredientId: "sweet-potato", amount: 120 },
        { label: "Rice/Carb" as never, value: "" } as never,
      ].filter((x) => "ingredientId" in x),
      imageQuery: "chicken burger sweet potato fries comfort",
    },
  ],
  light: [
    {
      title: "Greek yogurt power bowl",
      slot: "Breakfast",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 150 g Greek yogurt" },
        { label: "Fiber", value: "Add berries & chia" },
        { label: "Rice/Carb", value: "No refined carb" },
        { label: "Side", value: "Almonds, 10" },
        { label: "Drink", value: "Green tea" },
      ],
      plate: [
        { ingredientId: "greek-yogurt-0pct", amount: 150 },
        { ingredientId: "mixed-berries", amount: 80 },
        { ingredientId: "chia-seeds", amount: 15 },
        { ingredientId: "almonds", amount: 20 },
      ],
      imageQuery: "greek yogurt power bowl fresh healthy",
    },
    {
      title: "Grilled chicken salad bowl",
      slot: "Lunch",
      lines: [
        { label: "Portion", value: "1 large bowl" },
        { label: "Protein", value: "Add 140 g grilled chicken" },
        { label: "Fiber", value: "Add mixed greens, cucumber, tomato" },
        { label: "Rice/Carb", value: "1/4 cup quinoa" },
        { label: "Side", value: "Olive oil & lemon dressing" },
        { label: "Drink", value: "Cucumber mint water" },
      ],
      plate: [
        { ingredientId: "chicken-breast", amount: 140 },
        { ingredientId: "romaine-lettuce", amount: 80 },
        { ingredientId: "cucumber", amount: 60 },
        { ingredientId: "quinoa-cooked", amount: 60 },
        { ingredientId: "olive-oil", amount: 10 },
      ],
      imageQuery: "grilled chicken salad bowl fresh",
    },
    {
      title: "Salmon avocado bowl",
      slot: "Dinner",
      lines: [
        { label: "Portion", value: "1 bowl" },
        { label: "Protein", value: "Add 130 g salmon" },
        { label: "Fiber", value: "Add edamame & greens" },
        { label: "Rice/Carb", value: "1/3 cup brown rice" },
        { label: "Side", value: "Avocado, 1/4" },
        { label: "Drink", value: "Green tea" },
      ],
      plate: [
        { ingredientId: "salmon", amount: 130 },
        { ingredientId: "edamame", amount: 80 },
        { ingredientId: "brown-rice-cooked", amount: 80 },
        { ingredientId: "avocado", amount: 40 },
      ],
      imageQuery: "salmon avocado bowl fresh healthy",
    },
  ],
};

export function mealIdeasFor(cuisineId: string, _slot?: MealIdeaSlot, _goal?: string | null, _phaseId?: string): MealIdea[] {
  const templates = TEMPLATES[cuisineId] ?? TEMPLATES["light"]!;
  return templates.map((t, i) => ({ ...t, id: `${cuisineId}-${i}` }));
}
