# Virena Health

Build a premium, minimalist metabolic health web application called "Virena" optimized for cross-platform web browsers. 

Aesthetic & UI Guidelines:

- Clean, modern, faceless-creator style.

- Color Palette: Warm sand, soft beige, crisp cream, and deep chocolate brown accents.

- Highly intuitive UI with a prominent "Dual-Mode Toggle" at the top of the main dashboard: [General Wellness Mode] and [PCOS Mode].

Functional Core Specifications:

1. Interface, Toggle Views & Real-Time Analytics:

   - Include a clean "Total Macro Table" prominently on the dashboard displaying the live combined sum of Carbs, Protein, and Fats on the plate.

   - Default View (General Wellness Mode): Displays an interactive plate builder to log meals and an aesthetic, real-time updated graphic showing an estimated glucose curve response.

   - PCOS Mode View: When toggled on, the dashboard dynamically adds widgets for tracking menstrual cycle phases (Menstrual, Follicular, Ovulatory, Luteal), a hormonal symptom logging checklist, and switches the meal tracker to display strict high-glycemic (High-GI) red warning badges for triggering foods.

2. Smart Interactive Plate Builder & Metric Logic:

   - Include a searchable dropdown list of core ingredients (e.g., Avocado, Chicken Breast, White Rice, Broccoli, Oats, Eggs, Almonds, White Flour, White Sugar).

   - For every ingredient added to the plate, provide a toggle button to input portion sizes in either grams (g) or cup measurements.

   - Encode the mathematical logic directly into the frontend to automatically handle conversions (e.g., 1 cup of uncooked oats = 80g, 1 cup of cooked rice = 195g) on the fly, calculating the combined macronutrient breakdown (Carbs, Protein, Fats) instantly.

3. Health Specialist AI Guardrails & Smart Ingredient Swaps:

   - Live Nutrition Guardrail: Program a real-time tracking algorithm. If a user builds a plate where Carbohydrates are high but Protein is critically low, trigger an instant, supportive on-screen pop-up alert saying: "Let's optimize this plate! To stabilize your glucose levels and maintain energy, consider increasing your protein portion and lowering the carbohydrates slightly." Make this active in both modes, with a specialized emphasis on insulin sensitivity for the PCOS view.

   - Intelligent Ingredient Swaps: If a user selects an unhealthy or high-GI ingredient, trigger an automatic, immediate visual recommendation block beneath the plate builder offering healthy yet delicious alternatives. 

     * Example: If "White Flour" is added, display a badge suggesting "Try Almond Flour or Oat Flour for a blood-sugar-friendly, delicious alternative!"

     * Example: If "White Sugar" is added, display a badge suggesting "Swap for Stevia Drops or Monkfruit Sweetener to keep it sweet without the glucose spike!"

4. Backend & Data Infrastructure Architecture:

   - Design the application to connect natively with a free-tier Supabase backend for database storage and secure user profile tables.

   - Build a clean frontend landing page featuring a secure "Login with Google" button utilizing Google Authentication layout standards.

   - Ensure all frontend state management is fully optimized to run on standard free-tier hosting setups (like Vercel and Supabase) without requiring premium cloud computing features.

5. When a user signs up for the first time ask them some minimal questions to understand their goals for using the app. For example, someone wants to focus on having a PCOS diet tracking, another person might just want to eat healthier. Add relevant questions the answers of which should be used by the app's recommendation system to bring the most personalized benefit to users.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://virenahealth.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8bb1a3c9-09ac-4319-93a1-7c7e3b25d129).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
