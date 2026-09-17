import { useMemo } from "react";
import { glucoseCurve, glycemicLoad, type PlateItem } from "@/lib/nutrition";

const W = 620;
const H = 220;
const PAD = 28;

export function GlucoseCurve({ items, pcosMode }: { items: PlateItem[]; pcosMode: boolean }) {
  const { path, area, peak, gl } = useMemo(() => {
    const points = glucoseCurve(items, pcosMode);
    const maxV = 100;
    const xs = (t: number) => PAD + (t / 180) * (W - PAD * 2);
    const ys = (v: number) => H - PAD - (v / maxV) * (H - PAD * 2);

    const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${xs(p.t).toFixed(1)},${ys(p.v).toFixed(1)}`).join(" ");
    const a = `${d} L${xs(180).toFixed(1)},${ys(0).toFixed(1)} L${xs(0).toFixed(1)},${ys(0).toFixed(1)} Z`;

    return {
      path: d,
      area: a,
      peak: Math.max(...points.map((p) => p.v)),
      gl: glycemicLoad(items),
    };
  }, [items, pcosMode]);

  const verdict =
    peak < 18 ? "Very gentle" : peak < 35 ? "Gentle rise" : peak < 55 ? "Moderate rise" : "Sharp spike likely";

  return (
    <section className="surface p-6" aria-label="Estimated glucose response">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">Estimated Glucose Response</h2>
        <span className="text-sm text-muted-foreground">
          Glycemic load {gl.toFixed(1)} · {verdict}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Estimated glucose curve, peak ${Math.round(peak)} milligrams per deciliter above baseline`}
      >
        <defs>
          <linearGradient id="glucoseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--clay)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((v) => {
          const y = H - PAD - (v / 100) * (H - PAD * 2);
          return (
            <g key={v}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--border)" strokeWidth="1" />
              <text x={4} y={y + 4} fontSize="10" fill="var(--muted-foreground)">
                {v}
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#glucoseFill)" />
        <path
          d={path}
          fill="none"
          stroke="var(--cocoa)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {[0, 60, 120, 180].map((t) => (
          <text
            key={t}
            x={PAD + (t / 180) * (W - PAD * 2)}
            y={H - 6}
            fontSize="10"
            textAnchor="middle"
            fill="var(--muted-foreground)"
          >
            {t}m
          </text>
        ))}
      </svg>

      <p className="mt-2 text-sm text-muted-foreground">
        {pcosMode
          ? "PCOS view: curves are modelled with reduced insulin sensitivity, so spikes read higher and last longer."
          : "Protein and fat on the plate flatten and delay the curve. Estimates only — not medical advice."}
      </p>
    </section>
  );
}
