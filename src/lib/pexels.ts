/** Pre-fetched Pexels stock photo URLs for meal finder cards.
 * These are real, license-free images hosted on Pexels CDN. */

export const CUISINE_IMAGES: Record<string, string> = {
  "south-asian": "https://images.pexels.com/photos/8818667/pexels-photo-8818667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "middle-eastern": "https://images.pexels.com/photos/11161385/pexels-photo-11161385.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "east-asian": "https://images.pexels.com/photos/7594058/pexels-photo-7594058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  mediterranean: "https://images.pexels.com/photos/15146200/pexels-photo-15146200.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  italian: "https://images.pexels.com/photos/31637791/pexels-photo-31637791.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  latin: "https://images.pexels.com/photos/25391591/pexels-photo-25391591.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  comfort: "https://images.pexels.com/photos/34474143/pexels-photo-34474143.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  light: "https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
};

/** Fallback generic images per cuisine, used when a specific meal image isn't available. */
export function imageForCuisine(cuisineId: string): string {
  return (
    CUISINE_IMAGES[cuisineId] ??
    "https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
  );
}

/** Specific meal images keyed by meal idea title slug. */
export const MEAL_IMAGES: Record<string, string> = {
  "grilled-chicken-tandoori-bowl": "https://images.pexels.com/photos/8818667/pexels-photo-8818667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "grilled-chicken-salad-bowl": "https://images.pexels.com/photos/5192435/pexels-photo-5192435.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "salmon-avocado-bowl": "https://images.pexels.com/photos/8481855/pexels-photo-8481855.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "greek-yogurt-power-bowl": "https://images.pexels.com/photos/4006347/pexels-photo-4006347.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
};

export function imageForMeal(slug: string, cuisineId: string): string {
  return MEAL_IMAGES[slug] ?? imageForCuisine(cuisineId);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
