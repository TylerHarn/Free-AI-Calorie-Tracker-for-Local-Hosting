import type { WeighIn } from "../api";

const WIDTH = 400;
const HEIGHT = 180;
const PADDING = 24;

export default function WeightChart({ weighIns, goalWeightLb }: { weighIns: WeighIn[]; goalWeightLb: number | null }) {
  if (weighIns.length === 0) {
    return <p className="py-6 text-center font-sans text-sm text-ink/40">No weigh-ins logged yet.</p>;
  }

  const sorted = [...weighIns].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const weights = sorted.map((w) => w.weight_lb);
  const values = goalWeightLb != null ? [...weights, goalWeightLb] : weights;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yPad = range * 0.15;

  function yFor(weight: number) {
    const t = (weight - (min - yPad)) / (range + yPad * 2);
    return HEIGHT - PADDING - t * (HEIGHT - PADDING * 2);
  }

  const times = sorted.map((w) => new Date(w.created_at).getTime());
  const minTime = times[0];
  const maxTime = times[times.length - 1];
  const timeRange = maxTime - minTime || 1;

  function xFor(time: number) {
    const t = sorted.length === 1 ? 0.5 : (time - minTime) / timeRange;
    return PADDING + t * (WIDTH - PADDING * 2);
  }

  const points = sorted.map((w, i) => ({ x: xFor(times[i]), y: yFor(w.weight_lb) }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
      {goalWeightLb != null && (
        <>
          <line
            x1={PADDING}
            x2={WIDTH - PADDING}
            y1={yFor(goalWeightLb)}
            y2={yFor(goalWeightLb)}
            className="stroke-ink/25"
            strokeDasharray="4 3"
            strokeWidth={1}
          />
          <text x={WIDTH - PADDING} y={yFor(goalWeightLb) - 4} textAnchor="end" className="fill-ink/40 font-mono text-[9px]">
            Goal {goalWeightLb}lb
          </text>
        </>
      )}
      <path d={path} fill="none" className="stroke-ink" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-ink" />
      ))}
    </svg>
  );
}
