const SIZE = 200;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressBar({ consumed, goal }: { consumed: number; goal: number }) {
  const fraction = goal > 0 ? Math.min(1, consumed / goal) : 0;
  const isOver = consumed > goal;
  const isNearLimit = !isOver && fraction >= 0.9;

  const ringColor = isOver ? "stroke-rust" : isNearLimit ? "stroke-ember" : "stroke-sage";
  const labelColor = isOver ? "text-rust" : "text-ink";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-ink/10"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
            className={`${ringColor} transition-[stroke-dashoffset] duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-4xl font-bold tabular-nums ${labelColor}`}>{consumed}</span>
          <span className="font-mono text-sm text-ink/50">/ {goal} kcal</span>
        </div>
      </div>
      {isOver && (
        <p className="mt-2 font-mono text-xs text-rust">{consumed - goal} kcal over today's goal</p>
      )}
    </div>
  );
}
