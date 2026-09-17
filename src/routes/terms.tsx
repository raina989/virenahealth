import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Virena" },
      {
        name: "description",
        content:
          "The terms for using Virena: what the app does, what it doesn't, your account responsibilities and our medical disclaimer.",
      },
      { property: "og:title", content: "Terms of Use — Virena" },
      {
        property: "og:description",
        content: "Plain-language terms for using Virena's metabolic health and PCOS tracking tools.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Terms() {
  return (
    <main className="min-h-screen warm-gradient">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Virena
        </Link>
        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
          Privacy
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-24">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last updated 17 September 2026</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Terms of Use</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          By using Virena you agree to these terms. We've kept them short and readable.
        </p>

        <Section title="What Virena is">
          <p>
            A nutrition and metabolic wellness tool. It estimates macronutrients and a likely glucose response from
            published food composition data, and offers general, supportive suggestions.
          </p>
        </Section>

        <Section title="Medical disclaimer">
          <p>
            Virena is not a medical device, does not diagnose or treat any condition, and its glucose curves are
            estimates, not measurements. Never change medication, insulin, or a treatment plan based on Virena. Always
            consult a qualified healthcare professional, especially if you are pregnant, diabetic, or managing PCOS
            with medical support.
          </p>
        </Section>

        <Section title="Your account">
          <p>
            You sign in with Google and are responsible for keeping that account secure. Please provide accurate
            information during onboarding — the quality of your recommendations depends on it. One account per person.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don't attempt to access other users' data, reverse engineer the service, scrape it, or use it to provide
            clinical advice to others without appropriate qualifications.
          </p>
        </Section>

        <Section title="Availability and changes">
          <p>
            We aim for reliable service but provide the app "as is", without warranties. Features may change or be
            discontinued. We'll give notice in the app before material changes to these terms.
          </p>
        </Section>

        <Section title="Liability">
          <p>
            To the fullest extent permitted by law, Virena is not liable for indirect or consequential loss arising
            from use of the app or reliance on its estimates.
          </p>
        </Section>

        <Section title="Ending your use">
          <p>
            You can stop using Virena at any time and request deletion of your account and data at{" "}
            <span className="text-foreground">privacy@virena.app</span>. See our{" "}
            <Link to="/privacy" className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>{" "}
            for how your data is handled.
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
