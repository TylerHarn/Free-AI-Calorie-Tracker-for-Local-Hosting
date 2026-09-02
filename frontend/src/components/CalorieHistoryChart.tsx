const WIDTH = 400;
const HEIGHT = 180;
const PADDING = 16;
const BOTTOM_LABEL_SPACE = 18;

export interface DaySummary {
  dateLabel: string;
  net: number;
}

export default function CalorieHistoryChart({ days, goal }: { days: DaySummary[]; goal: number }) {
  if (days.length === 0) {
    return <p className="py-6 text-center font-sans text-sm text-ink/40">No history yet.</p>;
  }

  const chartHeight = HEIGHT - PADDING - BOTTOM_LABEL_SPACE;
  const maxValue = Math.max(goal, ...days.map((d) => d.net)) * 1.05;
  const barWidth = (WIDTH - PADDING * 2) / days.length;
  const goalY = PADDING + chartHeight - (goal / maxValue) * chartHeight;

  function barColor(net: number) {
    if (net > goal) return "fill-rust";
    if (net >= goal * 0.9) return "fill-ember";
    return "fill-sage";
  }

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
      <line x1={PADDING} x2={WIDTH - PADDING} y1={goalY} y2={goalY} className="stroke-ink/25" strokeDasharray="4 3" strokeWidth={1} />
      {days.map((day, i) => {
        const barHeight = Math.max(2, (day.net / maxValue) * chartHeight);
        const x = PADDING + i * barWidth + barWidth * 0.15;
        const y = PADDING + chartHeight - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth * 0.7} height={barHeight} rx={2} className={barColor(day.net)} />
            {(days.length - 1 - i) % 2 === 0 && (
              <text
                x={x + (barWidth * 0.7) / 2}
                y={HEIGHT - 4}
                textAnchor="middle"
                className="fill-ink/40 font-mono text-[8px]"
              >
                {day.dateLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
