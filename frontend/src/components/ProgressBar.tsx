export default function ProgressBar({ consumed, goal }: { consumed: number; goal: number }) {
  const percent = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const isOver = consumed > goal;
  const isNearLimit = !isOver && percent >= 90;

  const barColor = isOver ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600">Today</span>
        <span className={`text-sm font-semibold ${isOver ? "text-red-600" : "text-slate-700"}`}>
          {consumed} / {goal} kcal
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      {isOver && <p className="mt-2 text-xs text-red-600">{consumed - goal} kcal over your goal today.</p>}
    </div>
  );
}
