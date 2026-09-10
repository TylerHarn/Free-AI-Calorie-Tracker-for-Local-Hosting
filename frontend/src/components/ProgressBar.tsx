const SIZE = 200;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressBar({
  consumed,
  burned,
  goal,
}: {
  consumed: number;
  burned: number;
  goal: number;
}) {
  const net = consumed - burned;
  const fraction = goal > 0 ? Math.min(1, Math.max(0, net) / goal) : 0;
  const isOver = net > goal;
  const isNearLimit = !isOver && fraction >= 0.9;

  const ringColor = isOver ? "stroke-danger" : isNearLimit ? "stroke-warning" : "stroke-success";
  const labelColor = isOver ? "text-danger" : "text-ink";

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
          <span className={`text-4xl font-bold tabular-nums ${labelColor}`}>{net}</span>
          <span className="text-sm tabular-nums text-ink/50">/ {goal} kcal</span>
        </div>
      </div>

      {burned > 0 && (
        <span className="mt-3 inline-block rounded-full bg-workout/15 px-3 py-1 text-xs font-semibold tabular-nums text-workout">
          −{burned} kcal from workouts
        </span>
      )}

      {isOver && (
        <p className="mt-2 text-xs text-danger">{net - goal} kcal over today's goal</p>
      )}
    </div>
  );
}
