import type { Meal } from "../api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MealHistory({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return <p className="text-center text-sm text-slate-400">No meals logged yet.</p>;
  }

  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {meals.map((meal) => (
        <li
          key={meal.id}
          className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">{meal.food_name}</p>
            <p className="text-xs text-slate-400">{formatDate(meal.created_at)}</p>
          </div>
          <p className="text-sm font-semibold text-slate-700">{meal.estimated_calories} kcal</p>
        </li>
      ))}
    </ul>
  );
}
