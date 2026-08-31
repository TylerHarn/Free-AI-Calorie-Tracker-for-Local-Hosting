import type { Meal } from "../api";

const CONFIDENCE_STYLES: Record<Meal["confidence"], string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
};

export default function CalorieResult({ meal }: { meal: Meal }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{meal.food_name}</p>
      <p className="mt-1 text-5xl font-bold text-slate-900">
        {meal.estimated_calories}
        <span className="ml-1 text-lg font-medium text-slate-500">kcal</span>
      </p>
      <p className="mt-3 text-sm text-slate-600">{meal.description}</p>
      <span
        className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${CONFIDENCE_STYLES[meal.confidence]}`}
      >
        {meal.confidence} confidence
      </span>
    </div>
  );
}
