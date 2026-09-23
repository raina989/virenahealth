/** Cycle math, phase guidance, mood insights, tips and craving recipes. */

export type PhaseId = "menstrual" | "follicular" | "ovulatory" | "luteal";

export type PhaseInfo = {
  id: PhaseId;
  label: string;
  cycleDay: number;
  headline: string;
  foods: string[];
  /** true when the person is well past their expected period */
  extended: boolean;
  /** days past the expected period start (0 when not overdue) */
  overdueDays: number;
  /** e.g. "based on 4 logged cycles" */
  confidence: string;
  /** learned cycle length used for this estimate */
  cycleLength: number;
};

export type LearnedCycle = {
  /** learned (or default) cycle length in days */
  length: number;
  /** learned typical bleed length in days */
  periodLength: number;
  /** number of completed cycles used */
  samples: number;
  learned: boolean;
  confidence: string;
};

const DEFAULT_CYCLE = 28;

function toDate(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function ymd(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Groups logged bleeding days into period start dates (gaps > 2 days start a new period). */
export function periodStarts(days: string[]): string[] {
  const sorted = [...new Set(days)].sort();
  const starts: string[] = [];
  let prev: Date | null = null;
  for (const day of sorted) {
    const d = toDate(day);
    if (!prev || daysBetween(prev, d) > 2) starts.push(day);
    prev = d;
  }
  return starts;
}

/** Length of each logged bleed run, in days. */
function periodRuns(days: string[]): number[] {
  const sorted = [...new Set(days)].sort().map(toDate);
  const runs: number[] = [];
  let count = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    if (prev && daysBetween(prev, d) <= 2) count++;
    else {
      if (count) runs.push(count);
      count = 1;
    }
    prev = d;
  }
  if (count) runs.push(count);
  return runs;
}

/**
 * Learns a person's own rhythm from their logged period starts:
 * recent cycles weigh more, clear outliers are dropped.
 */
export function learnedCycle(days: string[]): LearnedCycle {
  const runs = periodRuns(days);
  const periodLength = runs.length
    ? Math.max(2, Math.round(runs.reduce((a, b) => a + b, 0) / runs.length))
    : 5;

  const starts = periodStarts(days).map(toDate);
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const gap = daysBetween(starts[i - 1]!, starts[i]!);
    if (gap >= 18 && gap <= 90) gaps.push(gap);
  }

  if (gaps.length === 0) {
    return {
      length: DEFAULT_CYCLE,
      periodLength,
      samples: 0,
      learned: false,
      confidence: "estimate — log a few more cycles",
    };
  }

  // Drop outliers more than 10 days from the median once we have enough data.
  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const median = sortedGaps[Math.floor(sortedGaps.length / 2)]!;
  const kept = gaps.length >= 3 ? gaps.filter((g) => Math.abs(g - median) <= 10) : gaps;
  const usable = kept.length ? kept : gaps;

  // Recency weighting: the most recent cycle counts most.
  let weighted = 0;
  let weights = 0;
  usable.forEach((gap, i) => {
    const w = i + 1;
    weighted += gap * w;
    weights += w;
  });

  const length = Math.round(weighted / weights);
  const learned = usable.length >= 2;
  return {
    length,
    periodLength,
    samples: usable.length,
    learned,
    confidence: learned
      ? `based on ${usable.length} logged cycles`
      : "estimate — log a few more cycles",
  };
}

export function averageCycleLength(days: string[]): number {
  return learnedCycle(days).length;
}

export const PHASE_ACTIONS: Record<PhaseId, { eat: string[]; move: string[] }> = {
  menstrual: {
    eat: [
      "Iron with vitamin C — lentils or red meat plus lemon or peppers",
      "Warm, cooked meals instead of raw salads",
      "Magnesium at night: pumpkin seeds or dark chocolate",
      "Extra water and a pinch of salt to replace what you lose",
    ],
    move: [
      "Gentle walking, 20–30 minutes daily",
      "Restorative yoga or stretching instead of hard sessions",
      "Rest without guilt if energy is low",
    ],
  },
  follicular: {
    eat: [
      "Protein at breakfast, every day this week",
      "Fermented foods (kefir, kimchi, sauerkraut) daily",
      "Flax and pumpkin seeds, 1 tbsp a day",
      "Leafy greens with lunch",
    ],
    move: [
      "Start building: 2 strength sessions this week",
      "Try something new — coordination is at its best",
      "Add one longer cardio session",
    ],
  },
  ovulatory: {
    eat: [
      "Cruciferous veg daily — broccoli, cauliflower, rocket",
      "Keep protein at every meal",
      "Antioxidant fruit: berries, citrus, pomegranate",
      "Hydrate well; keep alcohol low",
    ],
    move: [
      "Strength train while energy peaks — go heavier",
      "One high-intensity session is well tolerated now",
      "Warm up properly; joints are looser around ovulation",
    ],
  },
  luteal: {
    eat: [
      "Protein first at every meal (30 g+) to blunt cravings",
      "Complex carbs — sweet potato, quinoa, oats",
      "Magnesium and B6: pumpkin seeds, banana with nut butter",
      "Cut caffeine after midday to protect sleep",
    ],
    move: [
      "Steady-state cardio and moderate strength over intensity",
      "Walk 10 minutes after meals",
      "Prioritise sleep over an extra workout",
    ],
  },
};

const PHASE_CONTENT: Record<PhaseId, { label: string; headline: string; foods: string[] }> = {
  menstrual: {
    label: "Menstrual",
    headline: "Rebuild and warm up — iron and magnesium matter most today.",
    foods: [
      "Iron-rich plates: lentils, beef, spinach with a squeeze of lemon for absorption",
      "Warm, cooked meals over raw salads — easier on cramps and digestion",
      "Magnesium at night: pumpkin seeds, dark chocolate, or a warm cocoa",
    ],
  },
  follicular: {
    label: "Follicular",
    headline: "Energy is climbing — lean protein and fermented foods shine.",
    foods: [
      "Lean protein at breakfast: eggs, Greek yogurt, or chicken",
      "Fermented foods (kimchi, sauerkraut, kefir) to support estrogen clearance",
      "Sprouted seeds, flax and leafy greens with every lunch",
    ],
  },
  ovulatory: {
    label: "Ovulatory",
    headline: "Peak insulin sensitivity — this is your best day for carbs and fibre.",
    foods: [
      "Cruciferous veg: broccoli, cauliflower, rocket — they help clear excess estrogen",
      "Antioxidant fruit: berries, citrus, pomegranate",
      "Plenty of fibre and water; keep alcohol low around ovulation",
    ],
  },
  luteal: {
    label: "Luteal",
    headline: "Cravings rise and insulin dips — protein first, sugar last.",
    foods: [
      "Protein-first plates (30 g+) to blunt cravings before they start",
      "Complex carbs: sweet potato, quinoa, oats — not white bread or sweets",
      "Magnesium and B6: pumpkin seeds, banana with nut butter, dark chocolate",
    ],
  },
};

export function phaseForDate(periodDays: string[], date: Date): PhaseInfo | null {
  const starts = periodStarts(periodDays);
  if (starts.length === 0) return null;
  const target = toDate(ymd(date));
  const past = starts.map(toDate).filter((s) => s.getTime() <= target.getTime());
  if (past.length === 0) return null;
  const last = past[past.length - 1]!;
  const cycle = learnedCycle(periodDays);
  const length = cycle.length;
  const cycleDay = daysBetween(last, target) + 1;

  // Well past the expected period: stay in an extended luteal phase rather than guessing.
  if (cycleDay > length + 2) {
    return {
      id: "luteal",
      cycleDay,
      extended: true,
      overdueDays: cycleDay - length,
      confidence: cycle.confidence,
      cycleLength: length,
      label: "Extended luteal",
      headline: "A longer stretch than usual — steady blood sugar is the kindest thing you can do right now.",
      foods: PHASE_CONTENT.luteal.foods,
    };
  }

  const ovulation = Math.max(12, length - 14);
  let id: PhaseId = "luteal";
  if (cycleDay <= Math.max(3, cycle.periodLength)) id = "menstrual";
  else if (cycleDay < ovulation) id = "follicular";
  else if (cycleDay <= ovulation + 2) id = "ovulatory";

  return {
    id,
    cycleDay,
    extended: false,
    overdueDays: 0,
    confidence: cycle.confidence,
    cycleLength: length,
    ...PHASE_CONTENT[id],
  };
}

export const MOODS = ["Great", "Okay", "Low", "Tired", "Anxious", "Irritable", "Foggy"] as const;
export type Mood = (typeof MOODS)[number];

const MOOD_TIPS: Record<string, string[]> = {
  Great: ["Lock it in: note what you ate and slept today — this is your template."],
  Okay: ["Steady day. A protein-forward breakfast tomorrow keeps it that way."],
  Low: [
    "Get daylight on your face within 30 minutes of waking — it lifts mood more than caffeine.",
    "Omega-3s (salmon, walnuts, chia) and a 20-minute walk are the two most evidence-backed mood levers.",
  ],
  Tired: [
    "Front-load protein and iron at breakfast — eggs, Greek yogurt or lentils.",
    "Check hydration: 500 ml of water before coffee usually beats a second coffee.",
    "If this is week 4 of your cycle, lower-intensity movement will serve you better than a hard session.",
  ],
  Anxious: [
    "Magnesium glycinate at night and cutting caffeine after noon both calm the nervous system.",
    "Avoid eating carbs alone — the crash after a spike feels exactly like anxiety.",
  ],
  Irritable: [
    "Blood-sugar dips read as irritability. Eat protein within an hour of waking.",
    "Dark chocolate and pumpkin seeds top up magnesium, which drops premenstrually.",
  ],
  Foggy: [
    "Brain fog often follows a glucose spike — add protein and fat to your next carb.",
    "Ten minutes of walking after eating clears the fog faster than another coffee.",
  ],
};

const SYMPTOM_TIPS: Record<string, string> = {
  "Sugar cravings": "Eat 20–30 g of protein before anything sweet, then walk 10 minutes after.",
  Bloating: "Slow the meal down, reduce raw cruciferous veg today, and add ginger or peppermint tea.",
  Acne: "Lower dairy and refined sugar for a fortnight; add zinc-rich foods (pumpkin seeds, shellfish).",
  "Hair shedding": "Protein, iron and ferritin drive hair. Aim for 1.5 g protein per kg and check ferritin.",
  "Poor sleep": "No caffeine after midday, magnesium at night, and a protein/fat snack if you wake at 3am.",
  Headache: "Hydration plus electrolytes; skipping meals is the most common trigger.",
  Cramping: "Magnesium, omega-3s and heat. Anti-inflammatory foods beat sugar today.",
  "Brain fog": "Pair every carb with protein or fat — flat glucose, clear head.",
  Fatigue: "Iron with vitamin C at breakfast, daylight early, and no naked carbs.",
  "Mood swings": "Steady glucose is the fastest mood stabiliser: protein first at every meal.",
  Anxiety: "Magnesium, less caffeine, and never eat carbs on their own.",
  "Low mood": "Daylight, omega-3s and movement — small doses, daily.",
  Nausea: "Small, frequent, bland-but-protein-containing meals; ginger helps.",
  "Joint aches": "Omega-3s and colourful plants; lower ultra-processed seed-oil-heavy foods.",
};

export function dailyInsight(input: {
  mood: string | null;
  symptoms: string[];
  sleepHours: number | null;
}): string[] {
  const tips: string[] = [];
  if (input.mood && MOOD_TIPS[input.mood]) tips.push(...MOOD_TIPS[input.mood]!);
  for (const s of input.symptoms) if (SYMPTOM_TIPS[s]) tips.push(SYMPTOM_TIPS[s]!);
  if (input.sleepHours !== null) {
    if (input.sleepHours < 6)
      tips.push("Under 6 hours raises cortisol and cravings by up to 30% — plan a protein-heavy day and an early night.");
    else if (input.sleepHours >= 7.5)
      tips.push("Solid sleep — insulin sensitivity is at its best today, a good day to train.");
  }
  return [...new Set(tips)].slice(0, 5);
}

export const PCOS_TIPS = [
  "A tablespoon of apple cider vinegar in water before a carb-heavy meal can lower the glucose spike by up to 30%.",
  "Protein first, carbs last — eating in that order flattens your curve without changing the food.",
  "Aim for 25–30 g of fibre a day; fibre feeds the gut bugs that clear excess androgens.",
  "Strength training twice a week improves insulin sensitivity more than cardio for PCOS.",
  "Magnesium glycinate at night supports sleep, cramps and insulin sensitivity.",
  "Myo-inositol (with D-chiro at 40:1) has the strongest evidence of any PCOS supplement for ovulation.",
  "A 10-minute walk after each meal is as effective as one 30-minute walk for glucose control.",
  "Don't eat fruit naked — pair it with nuts, yogurt or cheese.",
  "Keep breakfast savoury. Sweet breakfasts set the craving tone for the whole day.",
  "Seed cycling: flax and pumpkin in the first half of your cycle, sesame and sunflower in the second.",
  "Skipping meals to 'save calories' raises cortisol and worsens insulin resistance.",
  "Spearmint tea twice a day has been shown to lower free testosterone over 30 days.",
];

export type CravingRecipe = {
  craving: string;
  title: string;
  ingredients: string[];
  method: string;
  win: string;
};

export const CRAVING_RECIPES: CravingRecipe[] = [
  {
    craving: "Cheesecake",
    title: "Strawberry protein cheesecake pots",
    ingredients: [
      "200 g Greek yogurt",
      "80 g light cream cheese",
      "1 scoop vanilla whey",
      "Monk fruit to taste",
      "Crushed strawberries",
      "1 tbsp crushed almonds",
    ],
    method: "Whip yogurt, cream cheese, whey and sweetener until thick, layer with strawberries and almonds, chill 2 hours.",
    win: "~25 g protein per pot instead of 35 g sugar.",
  },
  {
    craving: "Brownies",
    title: "Black bean fudge brownies",
    ingredients: ["1 tin black beans, rinsed", "2 eggs", "40 g cocoa", "60 g date paste", "2 tbsp almond butter", "Pinch salt"],
    method: "Blend everything smooth, bake at 180°C for 22 minutes, cool fully before cutting.",
    win: "Fibre and protein carry the sweetness — no flour, no sugar crash.",
  },
  {
    craving: "Fries",
    title: "Crispy air-fryer sweet potato & chickpea fries",
    ingredients: ["1 sweet potato, cut into batons", "1 tin chickpeas, dried well", "1 tbsp olive oil", "Paprika, garlic, salt"],
    method: "Toss, air-fry 18 minutes at 200°C shaking halfway, finish with lemon and yogurt dip.",
    win: "Same crunch with fibre and plant protein instead of refined oil.",
  },
  {
    craving: "Ice cream",
    title: "Two-minute berry protein nice-cream",
    ingredients: ["150 g frozen mixed berries", "100 g Greek yogurt", "1 scoop vanilla protein", "Splash milk"],
    method: "Blitz in a food processor until it looks like soft-serve, eat straight away.",
    win: "20 g protein, no spike, five minutes of work.",
  },
  {
    craving: "Pizza",
    title: "Chicken-crust or sourdough-base pizza",
    ingredients: ["150 g minced chicken + 1 egg + parmesan (crust)", "Passata", "Mozzarella", "Rocket and olives"],
    method: "Press the crust thin, bake 15 minutes, top and bake 8 more. Finish with rocket.",
    win: "Turns a 90 g carb meal into a 40 g protein one.",
  },
  {
    craving: "Boba",
    title: "Protein brown-sugar milk tea",
    ingredients: ["Strong brewed black tea", "200 ml milk or soy", "1 scoop vanilla protein", "Monk fruit", "Chia 'pearls' soaked 20 min"],
    method: "Shake tea, milk, protein and sweetener over ice; spoon in chia pearls.",
    win: "Chia pearls bring fibre and omega-3s instead of 50 g of tapioca starch.",
  },
  {
    craving: "Chips",
    title: "Salt & vinegar roasted edamame",
    ingredients: ["200 g shelled edamame", "1 tsp olive oil", "Vinegar powder or a splash of vinegar", "Sea salt"],
    method: "Roast at 200°C for 20 minutes until they squeak, season hot.",
    win: "18 g protein per bowl with the same salty crunch.",
  },
  {
    craving: "Pasta",
    title: "Lentil pasta with cottage-cheese alfredo",
    ingredients: ["Red lentil pasta", "200 g cottage cheese", "Garlic, parmesan, lemon", "Spinach and grilled chicken"],
    method: "Blend cottage cheese with garlic and parmesan, warm gently, fold through pasta and greens.",
    win: "Triple the protein and fibre of a white-flour bowl.",
  },
  {
    craving: "Milkshake",
    title: "Chocolate peanut butter thick shake",
    ingredients: ["Frozen banana half", "1 scoop chocolate protein", "1 tbsp peanut butter", "Milk", "Ice", "Cocoa"],
    method: "Blend thick, drink with a spoon.",
    win: "Dessert texture, breakfast-grade macros.",
  },
  {
    craving: "Doughnuts",
    title: "Baked almond-flour cinnamon doughnuts",
    ingredients: ["120 g almond flour", "2 eggs", "80 g Greek yogurt", "Monk fruit", "Baking powder", "Cinnamon"],
    method: "Mix, pipe into a doughnut tin, bake 15 minutes at 175°C, roll in cinnamon sweetener.",
    win: "Low-carb, 8 g protein each, no deep-frying.",
  },
];

export const LEAN_TIPS = [
  "Hit protein before you hit calories: 1.6–2.2 g per kg of bodyweight is the leaning sweet spot.",
  "Volume eating: bulk plates with veg so the plate looks full at a lower calorie cost.",
  "Two strength sessions a week protect muscle while you lose fat — cardio alone costs you both.",
  "Liquid calories are the easiest 300 kcal to delete.",
  "A 10,000-step baseline burns more over a week than any single workout.",
];

export const HEALTHY_TIPS = [
  "Half the plate vegetables, a palm of protein, a thumb of fat — no counting required.",
  "Eat the rainbow: 30 different plants a week is the strongest gut-health target we have.",
  "Cook once, eat twice — batch protein is what makes healthy eating survive a busy week.",
  "Swap, don't subtract. Every craving has a better-built version.",
];

export const GLUCOSE_TIPS = [
  "Savoury breakfast sets a flat curve for the whole day.",
  "Eat veg first, protein and fat second, starch last.",
  "Vinegar before carbs, and a walk after them.",
  "Never eat carbs naked — always dress them with protein, fat or fibre.",
];

export const PERFORMANCE_TIPS = [
  "Protein at 1.6 g/kg minimum, spread over 3–4 meals, drives recovery more than timing tricks.",
  "Carbs around training, protein everywhere else.",
  "Sleep is the most powerful legal performance drug — 7.5 hours minimum.",
  "Creatine monohydrate, 5 g daily, is the best evidence-backed supplement there is.",
];

export function tipsForGoal(goal: string | null | undefined): string[] {
  if (goal === "body-comp") return LEAN_TIPS;
  if (goal === "glucose") return GLUCOSE_TIPS;
  if (goal === "healthier") return HEALTHY_TIPS;
  return PERFORMANCE_TIPS;
}
