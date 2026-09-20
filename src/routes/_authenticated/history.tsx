import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/virena/AppHeader";
import { TodayPanel, type MealRow } from "@/components/virena/TodayPanel";
import { PhaseBanner } from "@/components/virena/PhaseBanner";
import { phaseForDate, ymd } from "@/lib/guidance";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Your Virena history" },
      {
        name: "description",
        content: "A calendar of every logged day — meals, macros, symptoms, mood, sleep and period days.",
      },
      { property: "og:title", content: "Your Virena history" },
      { property: "og:description", content: "Look back at any day: meals, macros, symptoms, sleep and cycle." },
    ],
  }),
  component: History,
});

type DailyRow = {
  log_date: string;
  mood: string | null;
  symptoms: string[];
  sleep_start: string | null;
  sleep_end: string | null;
  sleep_hours: number | null;
};

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function History() {
  const queryClient = useQueryClient();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(ymd(today));
  const [periodMode, setPeriodMode] = useState(false);

  const { data: userId } = useQuery({
    queryKey: ["user-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["all-meals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("id, meal_slot, logged_at, logged_on, items, carbs, protein, fats, calories")
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as (MealRow & { logged_on: string })[];
    },
  });

  const { data: dailies = [] } = useQuery({
    queryKey: ["all-daily-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("log_date, mood, symptoms, sleep_start, sleep_end, sleep_hours");
      if (error) throw error;
      return (data ?? []) as DailyRow[];
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

  const periodSet = useMemo(() => new Set(periods), [periods]);
  const loggedSet = useMemo(
    () => new Set([...meals.map((m) => m.logged_on), ...dailies.map((d) => d.log_date)]),
    [meals, dailies],
  );

  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const dayMeals = meals.filter((m) => m.logged_on === selected);
  const daily = dailies.find((d) => d.log_date === selected) ?? null;
  const phase = useMemo(() => {
    const [y, m, d] = selected.split("-").map(Number);
    return phaseForDate(periods, new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  }, [periods, selected]);

  async function togglePeriod(day: string) {
    if (!userId) return;
    if (periodSet.has(day)) {
      const { error } = await supabase.from("period_days").delete().eq("day", day).eq("user_id", userId);
      if (error) {
        toast.error("Couldn't remove that period day.");
        return;
      }
      toast.message("Period day removed.");
    } else {
      const { error } = await supabase.from("period_days").insert({ user_id: userId, day });
      if (error) {
        toast.error("Couldn't save that period day.");
        return;
      }
      toast.success("Period day logged.");
    }
    await queryClient.invalidateQueries({ queryKey: ["period-days"] });
  }

  function onDayClick(date: Date) {
    const day = ymd(date);
    setSelected(day);
    if (periodMode) void togglePeriod(day);
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader subtitle="Look back at any day" />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="surface p-6" aria-label="Calendar">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-display text-xl">
                {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                if (!date) return <span key={`empty-${i}`} />;
                const day = ymd(date);
                const isSelected = day === selected;
                const isPeriod = periodSet.has(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onDayClick(date)}
                    aria-pressed={isSelected}
                    className={`relative aspect-square rounded-xl border text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : isPeriod
                          ? "border-destructive/40 bg-destructive/10"
                          : "border-border hover:bg-secondary"
                    }`}
                  >
                    {date.getDate()}
                    {loggedSet.has(day) ? (
                      <span
                        aria-hidden
                        className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        }`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant={periodMode ? "default" : "outline"} size="sm" onClick={() => setPeriodMode((v) => !v)}>
                <Droplet className="mr-2 h-4 w-4" />
                {periodMode ? "Done logging period" : "Log period"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {periodMode ? "Tap days to mark or unmark bleeding." : "A dot means something was logged that day."}
              </p>
            </div>
          </section>

          <div className="space-y-6">
            <PhaseBanner phase={phase} />
            <TodayPanel
              meals={dayMeals}
              title={new Date(selected).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            />

            <section className="surface p-6" aria-label="Day details">
              <h2 className="font-display text-xl">Mood, symptoms & sleep</h2>
              {!daily ? (
                <p className="mt-3 text-sm text-muted-foreground">No check-in saved for this day.</p>
              ) : (
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Mood</dt>
                    <dd>{daily.mood ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Symptoms</dt>
                    <dd>{daily.symptoms?.length ? daily.symptoms.join(", ") : "None logged"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Sleep</dt>
                    <dd>
                      {daily.sleep_hours
                        ? `${daily.sleep_hours} h (${daily.sleep_start ?? "?"} → ${daily.sleep_end ?? "?"})`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Period</dt>
                    <dd>{periodSet.has(selected) ? "Bleeding day logged" : "—"}</dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
