# Virena — daily logs, calendar, smarter guidance

## 1. Daily log + calendar history
- Every saved meal gets a meal slot (Breakfast, Lunch, Dinner, Snack) chosen before saving.
- New "Today" panel on the dashboard: each logged meal listed with slot, time, calories and carbs/protein/fats, plus a day total.
- New **History** page with a month calendar. Each day shows a small marker when something was logged. Clicking a day opens the full detail: every meal with its ingredients and amounts, day macro totals, symptoms logged, mood, sleep, cycle phase and period days.
- Days are stored per calendar date so yesterday, last week and last month stay accessible.

## 2. Period logging + phase-aware recommendations
- The calendar gets a "Log period" action: tap a day (or a range) to mark bleeding days.
- From logged period start dates the app calculates the current cycle day and phase automatically.
- On opening the app, a top banner shows today's phase and 2-3 food recommendations written for that phase (e.g. iron and warm foods in menstrual, cruciferous veg and fibre around ovulation, protein-first and magnesium in luteal).
- If no period data exists yet, the banner invites the user to log their last period.

## 3. Much larger, categorised ingredient list
- Expand to several hundred items with per-100g carbs/protein/fat and GI, grouped into friendly categories: Proteins, Seafood, Dairy & Eggs, Legumes, Grains & Rice, Breads, Vegetables, Leafy greens, Fruits, Nuts & Seeds, Fats & Oils, Sweeteners (incl. stevia, monk fruit, dates, honey), Herbs & Spices, Sauces & Condiments, Drinks, and regional staples (South Asian, Middle Eastern, East Asian, Mediterranean, Latin).
- Search stays instant; categories are shown as headings in the picker.

## 4. Symptoms, mood and daily insight
- Symptom check-in is saved into the day's log (visible in Today and in the calendar detail), available in both modes.
- Add a mood picker (e.g. low, tired, anxious, irritable, foggy, good).
- A "Today's insight" card gives practical advice for the logged mood/symptoms — e.g. tired: protein + iron at breakfast, daylight within 30 min, check hydration; cravings: protein before sweets, 10-min walk after eating.

## 5. Sleep tracker
- Enter bedtime and wake time; the app shows duration, a simple quality note, and folds sleep into the day's log and the daily insight.
- Wearable sync (Apple Health, Fitbit, Oura, Garmin) cannot be added right now — those need developer accounts and approved app credentials from each provider. The plan includes a clearly-labelled "Connect a device — coming soon" placeholder so the layout is ready; I'll flag what you'd need to sign up for if you want it later.

## 6. PCOS auto-tips bar
- A rotating tips strip in PCOS mode that changes every 30 seconds (ACV before meals, protein first, fibre target, strength training, magnesium at night, inositol, seed cycling, walk after meals, etc.), with pause on hover and manual arrows.

## 7. Goal-driven General Wellness mode
- The app reads the user's onboarding goal and leads with it:
  - **Get leaner:** protein and calorie targets per plate, a protein-first nudge, and lean-focused tips.
  - **Eat healthier:** a "Craving rescue" section — pick a craving (cheesecake, brownies, fries, ice cream, pizza, boba, chips, pasta) and get a healthier make-at-home version (e.g. strawberry cheesecake with Greek yogurt + cream cheese), with ingredients and a one-line method.
  - **Steady glucose:** curve-flattening prompts.
- The mode toggle stays, but content and tips reorder themselves around the goal.

## 8. Progress meter
- A goal progress card that reflects whichever goal was chosen: consistency of logging, protein targets hit, share of balanced plates, cycle regularity and symptom trend for PCOS, protein/calorie adherence for leaner goals.
- Shown as a simple ring with a short plain-language readout and a 7-day streak.

## 9. Works for men too
- Onboarding adds a "Do you track a menstrual cycle?" question. When no, all cycle, period and PCOS surfaces are hidden and the second mode becomes a performance/metabolic focus instead.

## 10. Fixes and account behaviour
- **Onboarding submitted twice:** the finish step will wait for the save to confirm and refresh the stored profile before moving on, so one submit is enough.
- **Auto sign-out:** signed out automatically after 30 minutes of inactivity, and the session no longer survives closing the browser.
- **One browser at a time:** signing in registers the active session; if the same account signs in elsewhere, the older session is signed out on its next action. This can't be instant across devices, but the older browser will be kicked out within about a minute.

## Technical notes
- New tables: `meal_logs.meal_slot` + `logged_on` date column, `daily_logs` (mood, sleep start/end, notes, per-date), `period_days` (date, flow), and `active_sessions` (single-session enforcement). RLS scoped to `auth.uid()` with grants for `authenticated`.
- Cycle phase derived client-side from `period_days` using average cycle length, falling back to 28 days.
- Ingredient data stays a static typed table in `src/lib/nutrition.ts` (split into `src/lib/ingredients.ts`), so search and macro math stay instant and free to run.
- Session storage switches to non-persistent, with an inactivity timer in the root route; single-session check runs on focus and on a short interval.
