import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Virena" },
      {
        name: "description",
        content:
          "How Virena collects, stores and protects your food logs, cycle data and symptoms. We never sell or share your personal health data with third parties.",
      },
      { property: "og:title", content: "Privacy Policy — Virena" },
      {
        property: "og:description",
        content: "Your food, cycle and symptom data stays private to your account. Never sold, never shared.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Privacy() {
  return (
    <main className="min-h-screen warm-gradient">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Virena
        </Link>
        <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
          Terms
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-24">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last updated 17 September 2026</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Privacy Policy</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Virena handles sensitive health information — what you eat, where you are in your cycle, how you feel. We
          treat it with the care that deserves. In short: your data is yours, it is never sold, and it is never
          shared with advertisers or data brokers.
        </p>

        <Section title="What we collect">
          <p>
            <strong className="text-foreground">Account details.</strong> When you sign in with Google we receive your
            name, email address and profile photo. We never see or store your Google password.
          </p>
          <p>
            <strong className="text-foreground">Onboarding answers.</strong> Your goal, whether you have PCOS, focus
            areas, activity level and dietary pattern — used only to personalise your recommendations.
          </p>
          <p>
            <strong className="text-foreground">Health logs.</strong> Meals and ingredients you build, macros
            calculated from them, cycle phases and hormonal symptoms you record.
          </p>
          <p>We do not collect location data, contacts, or data from other apps on your device.</p>
        </Section>

        <Section title="How we use it">
          <p>
            Solely to run the app for you: showing your plate, calculating macros and glucose estimates, tailoring
            guardrails and swap suggestions, and keeping your history available when you sign back in.
          </p>
          <p>
            We do not use your health data for advertising, profiling, or to train machine learning models.
          </p>
        </Section>

        <Section title="No third-party sharing">
          <p>
            We do not sell, rent, or trade your personal data. We do not share it with advertisers, insurers,
            employers, or data brokers — ever.
          </p>
          <p>
            The only processors involved are the infrastructure providers that make the app run: Google (sign-in
            only) and our managed database and hosting provider, which stores your data under contract and cannot
            use it for its own purposes. We would only disclose data if legally compelled by a valid court order.
          </p>
        </Section>

        <Section title="How your data is protected">
          <p>
            Every record is tied to your user account and protected by row-level security in the database, which
            means queries can only ever return your own rows — other users are technically unable to read them.
          </p>
          <p>All traffic is encrypted in transit with HTTPS, and data is encrypted at rest by our provider.</p>
        </Section>

        <Section title="Your rights and control">
          <p>
            You can view and edit your logs at any time from your dashboard. You can request a full export or the
            permanent deletion of your account and all associated data by emailing us — deletion is completed within
            30 days and cascades to every meal, cycle and symptom record.
          </p>
          <p>
            Depending on where you live, you may have additional rights under the GDPR or similar laws, including
            access, correction, portability and objection. We honour these requests for everyone, regardless of
            location.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            We keep your logs for as long as your account is active, because history is what makes the app useful. If
            your account is inactive for 24 months we will contact you before removing the data.
          </p>
        </Section>

        <Section title="Children">
          <p>Virena is not intended for anyone under 16, and we do not knowingly collect their data.</p>
        </Section>

        <Section title="Not medical advice">
          <p>
            Virena offers general nutrition guidance and estimated glucose responses based on published food data.
            It is not a medical device and not a substitute for advice from your doctor or dietitian.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions, export or deletion requests: <span className="text-foreground">privacy@virena.app</span>. We
            respond within 5 working days. If this policy changes we will update the date above and notify you in the
            app before the change takes effect.
          </p>
        </Section>

        <div className="mt-12">
          <Link to="/" className="text-sm text-foreground underline underline-offset-4">
            Back to Virena
          </Link>
        </div>
      </article>
    </main>
  );
}
