import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Leaf, LogOut, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MacroTable } from "@/components/virena/MacroTable";
import { GlucoseCurve } from "@/components/virena/GlucoseCurve";
import { PlateBuilder } from "@/components/virena/PlateBuilder";
import { PcosPanel } from "@/components/virena/PcosPanel";
import {
  SWAPS,
  evaluateGuardrail,
  getIngredient,
  isHighGI,
  totalMacros,
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

  const [items, setItems] = useState<PlateItem[]>([]);
  const [mode, setMode] = useState<Mode>("general");
  const [modeTouched, setModeTouched] = useState(false);
  const [phase, setPhase] = useState("follicular");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
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

  const pcosMode = mode === "pcos";
  const macros = useMemo(() => totalMacros(items), [items]);
  const guardrail = useMemo(() => evaluateGuardrail(items, pcosMode), [items, pcosMode]);

  const swaps = useMemo(() => {
    const seen = new Set<string>();
    return items
      .map((i) => i.ingredientId)
      .filter((id) => {
        if (seen.has(id) || !SWAPS[id]) return false;
        seen.add(id);
        return true;
      })
      .map((id) => ({ id, ...SWAPS[id] }));
  }, [items]);

  const highGiItems = useMemo(
    () => [...new Set(items.map((i) => i.ingredientId))].filter(isHighGI).map((id) => getIngredient(id).name),
    [items],
  );

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
      items: items.map((i) => ({ ingredient: i.ingredientId, amount: i.amount, unit: i.unit })),
      carbs: Number(macros.carbs.toFixed(1)),
      protein: Number(macros.protein.toFixed(1)),
      fats: Number(macros.fats.toFixed(1)),
      calories: Math.round(macros.calories),
    });

    if (pcosMode && !error) {
      await supabase
        .from("cycle_entries")
        .upsert({ user_id: auth.user.id, phase, symptoms }, { onConflict: "user_id,entry_date" });
    }

    setSaving(false);
    if (error) {
      toast.error("We couldn't save this meal. Please try again.");
      return;
    }
    toast.success("Meal logged.");
    setItems([]);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <span className="font-display text-2xl">Virena</span>
            <p className="text-xs text-muted-foreground">
              {profile?.display_name ? `Welcome back, ${profile.display_name.split(" ")[0]}` : "Welcome back"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
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
                { id: "pcos", label: "PCOS Mode" },
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
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-clay" aria-hidden />
              {personalTip}
            </p>
          ) : null}
        </div>

        {guardrail ? (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${
              guardrail.level === "warn"
                ? "border-destructive/40 bg-destructive/10"
                : "border-border bg-accent/40"
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

            <div className="flex justify-end">
              <Button onClick={() => void saveMeal()} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : pcosMode ? "Log meal & cycle check-in" : "Log this meal"}
              </Button>
            </div>
          </div>
        </div>

        {pcosMode ? (
          <PcosPanel
            phase={phase}
            onPhaseChange={setPhase}
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
