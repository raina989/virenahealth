import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, Droplets, LineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import heroPlate from "@/assets/hero-plate.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virena — Metabolic Health & PCOS Nutrition Tracker" },
      {
        name: "description",
        content:
          "Build your plate, see live carbs, protein and fats, and watch your estimated glucose curve. A dedicated PCOS mode tracks cycle phases and hormonal symptoms.",
      },
      { property: "og:title", content: "Virena — Metabolic Health & PCOS Nutrition Tracker" },
      {
        property: "og:description",
        content: "Live macros, glucose-curve estimates and a dedicated PCOS mode. Calm, considered nutrition.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Sparkles,
    title: "Smart plate builder",
    body: "Search real ingredients, log in grams or cups, and let Virena convert and calculate macros as you go.",
  },
  {
    icon: LineChart,
    title: "Live glucose curve",
    body: "Watch an estimated glucose response redraw itself with every ingredient you add or remove.",
  },
  {
    icon: Droplets,
    title: "PCOS mode",
    body: "Cycle phases, hormonal symptom logging and strict high-GI warnings on insulin-triggering foods.",
  },
  {
    icon: Activity,
    title: "Gentle guardrails",
    body: "High carbs with low protein? Virena nudges you toward a steadier plate, kindly and instantly.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) {
        cancelled = true;
        void navigate({ to: "/dashboard" });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) go();
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });

    // The preview auth storage can hydrate slightly after mount / OAuth return.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (cancelled || tries > 20) {
        window.clearInterval(timer);
        return;
      }
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.clearInterval(timer);
          go();
        }
      });
    }, 500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function signIn() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("We couldn't sign you in. Please try again.");
      return;
    }
    if (result.redirected) return;

    // Wait for the session to be readable before routing into the app.
    for (let i = 0; i < 20; i += 1) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        void navigate({ to: "/dashboard" });
        return;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    setLoading(false);
    toast.error("Sign-in didn't complete. Please try again.");
  }

  return (
    <main className="min-h-screen warm-gradient">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <span className="font-display text-2xl tracking-tight">Virena</span>
        <Button variant="ghost" onClick={signIn} disabled={loading}>
          Sign in
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Metabolic health, softly</p>
          <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">
            Eat for steady
            <br />
            energy.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Virena turns every plate into a clear picture — carbs, protein, fats and the glucose curve that
            follows. With a dedicated PCOS mode for cycle-aware eating.
          </p>

          <div className="mt-9 max-w-sm">
            <Button size="lg" className="w-full gap-3" onClick={signIn} disabled={loading}>
              <GoogleMark />
              {loading ? "Opening Google…" : "Continue with Google"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Secure Google sign-in. Your food and symptom logs stay private to your account.
            </p>
          </div>
        </div>

        <div className="relative">
          <img
            src={heroPlate}
            alt="A cream ceramic plate with avocado, soft-boiled eggs, chickpeas and greens on warm linen"
            width={1280}
            height={1280}
            className="w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface p-6">
              <f.icon className="h-5 w-5 text-clay" aria-hidden />
              <h2 className="mt-4 font-display text-lg">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Virena offers general nutrition guidance and is not a substitute for medical advice.
        </p>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.09C6.23 6.88 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}
