type Props = {
  percent: number;
  headline: string;
  readout: string;
  streak: number;
};

export function ProgressMeter({ percent, headline, readout, streak }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <section className="surface flex flex-wrap items-center gap-6 p-6" aria-label="Goal progress">
      <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`${clamped}% towards your goal`}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="61" textAnchor="middle" className="fill-foreground font-display text-xl">
          {clamped}%
        </text>
      </svg>

      <div className="min-w-[14rem] flex-1">
        <h2 className="font-display text-xl">{headline}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{readout}</p>
        <p className="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium">
          {streak} day{streak === 1 ? "" : "s"} logging streak
        </p>
      </div>
    </section>
  );
}
