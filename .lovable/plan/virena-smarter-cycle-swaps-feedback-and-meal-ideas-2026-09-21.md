# Virena: smarter cycle, swaps, feedback and meal ideas

## 1. Remove the duplicate symptoms box
The symptom checklist appears twice (in the daily check-in and again in the PCOS panel). Keep the one in the daily check-in; the PCOS panel becomes a phase-only card, so symptoms are logged in a single place and saved once.

## 2. Cycle intelligence that learns from you
- Learn each person's own rhythm from their logged period start dates: recent cycles count more than old ones, unusual outliers are ignored, and the app shows "your average cycle: 34 days" once there's enough history (falls back to 28 days until then).
- Also learn typical period length from logged bleeding days.
- Today's phase is worked out from the last period start plus the learned length, with a quiet confidence note ("based on 4 logged cycles" / "estimate — log a few more cycles").
- If someone is well past their expected period (common with PCOS), instead of breaking, it shows subtly: "Day 62 · extended luteal phase — your period is 28 days later than your usual rhythm", with calm, non-alarming wording.

## 3. Phase guidance at the top of the day
The banner becomes: "You're in your ovulatory phase" → "What to prioritise this week" → two short tick-off lists, **Eat** and **Move**, 3–4 doable points each per phase (e.g. ovulatory: cruciferous veg daily, keep protein at every meal / strength training while energy peaks). Ticks are remembered for the week on the device.

## 4. Tiered swap cards with a taste-vs-health choice
When a plate contains a high-GI or refined item, cards appear right under the plate builder:

```text
🟢 Best metabolic option   Almond-flour roti      Health 9/10 · Taste match 5/10   [Choose]
🟡 Balanced option         Whole-wheat roti       Health 7/10 · Taste match 8/10   [Choose]
🔴 Original                Refined-flour roti     Health 3/10 · Taste match 10/10
```

Choosing a swap asks "What's your priority?" — 🫀 Maximum health / ⚖️ Balance / 😋 Closest to original taste — and the recommendation re-resolves to the matching option ("You chose closest to original taste → try whole-wheat khaboos instead"), with a one-tap button to put the swapped ingredient on the plate.

A tiered swap library covers the refined staples: white rice, roti/bread, pasta, potatoes/fries, sugar, chips, ice cream, juice, cola, granola, donuts, cereal and similar.

## 5. Swap feedback survey
After a swap is chosen (and again next time that swap appears), a short survey: Did you make/buy this swap? Yes/No → How did it taste? 1–5 stars → How close to the original? 1–5 stars → Would you make it again? Definitely / Maybe / No. Saved to the account, one card at a time so it never feels like a form.

## 6. Feedback admin view for khanraina12@gmail.com
A new admin-only page lists every submitted swap survey: swap name, ratings, would-repeat, date, plus averages per swap. Access is granted by an admin role attached to that email; the link only appears for admins.

## 7. "Need recommendations" meal finder
A button opens: What meal? (breakfast / lunch / dinner / snack) → What do you feel like? (South Asian, Middle Eastern, East Asian, Mediterranean, Latin, Comfort food, Light & fresh) → three unique built plates in the requested shape:

```text
Portion: 1 medium bowl
Protein: Add 150 g grilled chicken
Fiber:   Add a cucumber-tomato kachumber
Rice:    Swap to 3/4 cup basmati
Side:    Greek yogurt raita
Drink:   Mint lime soda
```

Each option carries a matching food photo and adapts to the person's mode, goal and current cycle phase (e.g. luteal leans protein-forward). One tap loads the option onto the plate builder.

## Technical notes
- New guidance module functions: `learnedCycle(periodDays)` (weighted average, outlier filtering, confidence, period length) and an upgraded `phaseForDate` that returns extended-luteal state instead of `null` when overdue; new `PHASE_ACTIONS` (eat/move checklists per phase).
- New `src/lib/swaps.ts` with tiered swap entries (`best` / `balanced` / `original`, health + taste scores, priority resolution).
- New `src/lib/meal-ideas.ts` with cuisine × slot templates and phase/goal adjustments; photos generated into `src/assets/cuisines/`.
- Migration: `swap_feedback` table (user_id, swap_key, chosen_option, made_it, taste_rating, closeness_rating, would_repeat, created_at) with RLS so users manage their own rows and admins can read all; `app_role` enum + `user_roles` table + `has_role()` security-definer function; admin role seeded for khanraina12@gmail.com. GRANTs included.
- New route `src/routes/_authenticated/feedback.tsx` guarded by `has_role`.
- Dashboard: drop `PcosPanel`'s symptom list, mount the swap cards, survey and meal finder.
