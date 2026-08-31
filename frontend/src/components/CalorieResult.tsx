import { useState } from "react";
import type { Confidence, MealEstimate } from "../api";

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
  manual: "bg-slate-100 text-slate-600",
};

export default function CalorieResult({
  estimate,
  onAdd,
  onDiscard,
  isSaving,
}: {
  estimate: MealEstimate;
  onAdd: (calories: number) => void;
  onDiscard: () => void;
  isSaving: boolean;
}) {
  const [calories, setCalories] = useState(String(estimate.estimated_calories));

  const parsedCalories = Number(calories);
  const isValid = calories.trim() !== "" && Number.isFinite(parsedCalories) && parsedCalories >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{estimate.food_name}</p>
      <div className="mt-1 flex items-baseline justify-center gap-1">
        <input
          type="number"
          min={0}
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-28 rounded-lg border border-slate-200 py-1 text-center text-4xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
        />
        <span className="text-lg font-medium text-slate-500">kcal</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{estimate.description}</p>
      <span
        className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${CONFIDENCE_STYLES[estimate.confidence]}`}
      >
        {estimate.confidence} confidence
      </span>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => onAdd(parsedCalories)}
          disabled={isSaving || !isValid}
          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSaving ? "Adding..." : "Add to log"}
        </button>
      </div>
    </div>
  );
}
