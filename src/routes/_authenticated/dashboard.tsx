import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Leaf, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MacroTable } from "@/components/virena/MacroTable";
import { GlucoseCurve } from "@/components/virena/GlucoseCurve";
import { PlateBuilder } from "@/components/virena/PlateBuilder";
import { PcosPanel } from "@/components/virena/PcosPanel";
import { AppHeader } from "@/components/virena/AppHeader";
import { TodayPanel, type MealRow } from "@/components/virena/TodayPanel";
import { PhaseBanner } from "@/components/virena/PhaseBanner";
import { TipsBar } from "@/components/virena/TipsBar";
import { CravingRescue } from "@/components/virena/CravingRescue";
import { ProgressMeter } from "@/components/virena/ProgressMeter";
import { DailyCheckIn, sleepHours, type CheckInState } from "@/components/virena/DailyCheckIn";
import { PCOS_TIPS, phaseForDate, tipsForGoal, ymd } from "@/lib/guidance";
import {
  MEAL_SLOTS,
  SWAPS,
  evaluateGuardrail,
  getIngredient,
  isHighGI,
  totalMacros,
  type MealSlot,
  type PlateItem,
} from "@/lib/nutrition";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Virena dashboard" },
      {
        name: "description",
        content: "Build your plate, track live macros, and watch your estimated glucose curve respond.",
      },
      { property: "og:title", content: "Your Virena dashboard" },
      { property: "og:description", content: "Live macros, glucose curves and PCOS tracking in one calm view." },
    ],
  }),
  component: Dashboard,
});

type Mode = "general" | "pcos";

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const todayKey = ymd(new Date());

  const [items, setItems] = useState<PlateItem[]>([]);
  const [slot, setSlot] = useState<MealSlot>("Breakfast");
  const [mode, setMode] = useState<Mode>("general");
  const [modeTouched, setModeTouched] = useState(false);
  const [phaseChoice, setPhaseChoice] = useState("follicular");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingCheckIn, setSavingCheckIn] = useState(false);
  const [checkIn, setCheckIn] = useState<CheckInState>({
    mood: null,
    symptoms: [],
    sleepStart: "",
    sleepEnd: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: todayMeals = [] } = useQuery({
    queryKey: ["meals", todayKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("id, meal_slot, logged_at, items, carbs, protein, fats, calories")
        .eq("logged_on", todayKey)
        .order("logged_at");
      if (error) throw error;
      return (data ?? []) as MealRow[];
    },
  });

  const { data: recentDays = [] } = useQuery({
    queryKey: ["recent-daily-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("log_date, mood, symptoms, sleep_start, sleep_end")
        .order("log_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: recentMeals = [] } = useQuery({
    queryKey: ["recent-meals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("logged_on, protein, calories")
        .order("logged_on", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: periods = [] } = useQuery({
    queryKey: ["period-days"],
    queryFn: async () => {
      const { data, error } = await supabase.from("period_days").select("day").order("day");
      if (error) throw error;
      return (data ?? []).map((r) => r.day as string);
    },
  });

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_complete) {
      void navigate({ to: "/onboarding" });
    }
  }, [isLoading, profile, navigate]);

  useEffect(() => {
    if (profile && !modeTouched) setMode(profile.default_mode === "pcos" ? "pcos" : "general");
  }, [profile, modeTouched]);

  // Load today's saved check-in once.
  useEffect(() => {
    const row = recentDays.find((d) => d.log_date === todayKey);
    if (!row) return;
    setCheckIn((prev) =>
      prev.mood === null && prev.symptoms.length === 0 && !prev.sleepStart
        ? {
            mood: row.mood ?? null,
            symptoms: row.symptoms ?? [],
            sleepStart: row.sleep_start ?? "",
            sleepEnd: row.sleep_end ?? "",
          }
        : prev,
    );
  }, [recentDays, todayKey]);

  const tracksCycle = profile?.tracks_cycle !== false;
  const pcosMode = mode === "pcos" && tracksCycle;
  const macros = useMemo(() => totalMacros(items), [items]);
  const guardrail = useMemo(() => evaluateGuardrail(items, pcosMode), [items, pcosMode]);
  const phase = useMemo(() => (tracksCycle ? phaseForDate(periods, new Date()) : null), [periods, tracksCycle]);

  const swaps = useMemo(() => {
    const seen = new Set<string>();
    return items
      .map((i) => i.ingredientId)
      .filter((id) => {
        if (seen.has(id) || !SWAPS[id]) return false;
        seen.add(id);
        return true;
      })
      .map((id) => ({ id, ...SWAPS[id]! }));
  }, [items]);

  const highGiItems = useMemo(
    () => [...new Set(items.map((i) => i.ingredientId))].filter(isHighGI).map((id) => getIngredient(id).name),
    [items],
  );

  const progress = useMemo(() => {
    const loggedDays = new Set<string>([
      ...recentMeals.map((m) => m.logged_on as string),
      ...recentDays.map((d) => d.log_date as string),
    ]);

    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (loggedDays.has(ymd(d))) streak++;
      else if (i > 0) break;
    }

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return ymd(d);
    });
    const consistency = last7.filter((d) => loggedDays.has(d)).length / 7;

    const proteinByDay = new Map<string, number>();
    for (const m of recentMeals) {
      const key = m.logged_on as string;
      proteinByDay.set(key, (proteinByDay.get(key) ?? 0) + Number(m.protein));
    }
    const proteinDays = last7.filter((d) => (proteinByDay.get(d) ?? 0) >= 90).length / 7;

    const goal = profile?.primary_goal;
    const percent = Math.round((consistency * 0.6 + proteinDays * 0.4) * 100);
    const headline =
      goal === "pcos"
        ? "Restoring your cycle"
        : goal === "body-comp"
          ? "Getting leaner"
          : goal === "glucose"
            ? "Steadier glucose"
            : "Eating better";
    const readout =
      consistency === 0
        ? "Log your first meal or check-in today to start your journey."
        : `You've logged ${Math.round(consistency * 7)} of the last 7 days, and hit a strong protein day ${Math.round(
            proteinDays * 7,
          )} times.`;
    return { percent, headline, readout, streak };
  }, [recentMeals, recentDays, profile]);

  const tips = pcosMode ? PCOS_TIPS : tipsForGoal(profile?.primary_goal);

  const personalTip = useMemo(() => {
    if (!profile) return null;
    if (profile.primary_goal === "pcos" || pcosMode)
      return "Your goal is PCOS support — lead every plate with protein and fibre, and keep fruit paired with fat.";
    if (profile.primary_goal === "glucose")
      return "You're chasing steadier glucose — a 10-minute walk after eating flattens the curve further.";
    if (profile.primary_goal === "body-comp")
      return "For body composition, aim for at least 30 g of protein on this plate before adding carbs.";
    return "Aim for half the plate as vegetables, a solid palm of protein, and a thumb of healthy fat.";
  }, [profile, pcosMode]);

  async function saveMeal() {
    if (items.length === 0) {
      toast.error("Add something to your plate first.");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("meal_logs").insert({
      user_id: auth.user.id,
      mode,
      meal_slot: slot,
      logged_on: todayKey,
      items: items.map((i) => ({ ingredient: i.ingredientId, amount: i.amount, unit: i.unit })),
      carbs: Number(macros.carbs.toFixed(1)),
      protein: Number(macros.protein.toFixed(1)),
      fats: Number(macros.fats.toFixed(1)),
      calories: Math.round(macros.calories),
    });

    if (pcosMode && !error) {
      await supabase
        .from("cycle_entries")
        .upsert({ user_id: auth.user.id, phase: phaseChoice, symptoms }, { onConflict: "user_id,entry_date" });
    }

    setSaving(false);
    if (error) {
      toast.error("We couldn't save this meal. Please try again.");
      return;
    }
    toast.success(`${slot} logged.`);
    setItems([]);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["meals", todayKey] }),
      queryClient.invalidateQueries({ queryKey: ["recent-meals"] }),
    ]);
  }

  async function saveCheckIn() {
    setSavingCheckIn(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSavingCheckIn(false);
      return;
    }
    const hours = sleepHours(checkIn.sleepStart, checkIn.sleepEnd);
    const { error } = await supabase.from("daily_logs").upsert(
      {
        user_id: auth.user.id,
        log_date: todayKey,
        mood: checkIn.mood,
        symptoms: checkIn.symptoms,
        sleep_start: checkIn.sleepStart || null,
        sleep_end: checkIn.sleepEnd || null,
        sleep_hours: hours,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,log_date" },
    );
    setSavingCheckIn(false);
    if (error) {
      toast.error("We couldn't save your check-in.");
      return;
    }
    toast.success("Check-in saved.");
    await queryClient.invalidateQueries({ queryKey: ["recent-daily-logs"] });
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader
        subtitle={profile?.display_name ? `Welcome back, ${profile.display_name.split(" ")[0]}` : "Welcome back"}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {tracksCycle ? <PhaseBanner phase={phase} /> : null}

        <TipsBar tips={tips} label={pcosMode ? "PCOS tips" : "Daily tips"} />

        {/* Dual-mode toggle */}
        <div className="flex flex-col items-center">
          <div
            className="inline-flex rounded-full border border-border bg-secondary p-1 shadow-[var(--shadow-soft)]"
            role="tablist"
            aria-label="Dashboard mode"
          >
            {(
              [
                { id: "general", label: "General Wellness Mode" },
                { id: "pcos", label: tracksCycle ? "PCOS Mode" : "Performance Mode" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                onClick={() => {
                  setMode(m.id);
                  setModeTouched(true);
                }}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                  mode === m.id
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {personalTip ? (
            <p className="mt-3 flex items-center gap-2 text-center text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 shrink-0 text-clay" aria-hidden />
              {personalTip}
            </p>
          ) : null}
        </div>

        <ProgressMeter
          percent={progress.percent}
          headline={progress.headline}
          readout={progress.readout}
          streak={progress.streak}
        />

        {guardrail ? (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${
              guardrail.level === "warn" ? "border-destructive/40 bg-destructive/10" : "border-border bg-accent/40"
            }`}
          >
            {guardrail.level === "warn" ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
            ) : (
              <Leaf className="mt-0.5 h-5 w-5 text-protein" aria-hidden />
            )}
            <div>
              <p className="font-medium">{guardrail.title}</p>
              <p className="text-sm text-muted-foreground">{guardrail.message}</p>
            </div>
          </div>
        ) : null}

        <MacroTable macros={macros} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <PlateBuilder items={items} onChange={setItems} pcosMode={pcosMode} />

            {swaps.length > 0 ? (
              <section className="surface p-6" aria-label="Smarter swaps">
                <h2 className="font-display text-xl">Smarter swaps</h2>
                <ul className="mt-4 space-y-3">
                  {swaps.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border border-accent bg-accent/40 px-4 py-3 text-sm text-accent-foreground"
                    >
                      <span className="font-medium">{s.title} → </span>
                      {s.message}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className="space-y-6">
            <GlucoseCurve items={items} pcosMode={pcosMode} />

            {pcosMode && highGiItems.length > 0 ? (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm">
                <p className="font-medium text-destructive">Insulin-trigger foods on this plate</p>
                <p className="text-muted-foreground">
                  {highGiItems.join(", ")} — pair with protein, fat or fibre, or swap them out below.
                </p>
              </div>
            ) : null}

            <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
              <div
                className="flex flex-wrap gap-1.5"
                role="radiogroup"
                aria-label="Which meal is this?"
              >
                {MEAL_SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={slot === s}
                    onClick={() => setSlot(s)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      slot === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Button onClick={() => void saveMeal()} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : `Log ${slot.toLowerCase()}`}
              </Button>
            </div>
          </div>
        </div>

        <TodayPanel meals={todayMeals} />

        <DailyCheckIn value={checkIn} onChange={setCheckIn} onSave={() => void saveCheckIn()} saving={savingCheckIn} />

        {profile?.primary_goal === "healthier" || !pcosMode ? <CravingRescue /> : null}

        {pcosMode ? (
          <PcosPanel
            phase={phaseChoice}
            onPhaseChange={setPhaseChoice}
            symptoms={symptoms}
            onSymptomsChange={setSymptoms}
          />
        ) : null}

        <p className="pb-6 text-center text-xs text-muted-foreground">
          Estimates are educational and not a substitute for medical advice.
        </p>
      </div>
    </main>
  );
}
