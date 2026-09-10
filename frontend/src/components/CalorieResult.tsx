import { useState } from "react";
import type { Confidence, MealEstimate } from "../api";

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  low: "bg-danger/15 text-danger",
  manual: "bg-ink/10 text-ink/60",
  barcode: "bg-workout/15 text-workout",
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
    <div className="rounded-2xl border border-ink/10 bg-paper-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">New entry</p>
      <p className="mt-1 text-xl font-semibold text-ink">{estimate.food_name}</p>

      <div className="mt-3 flex items-baseline gap-1">
        <input
          type="number"
          min={0}
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-28 rounded-lg border border-ink/15 bg-paper px-2 py-1 text-3xl font-bold tabular-nums text-ink focus:border-accent focus:outline-none"
        />
        <span className="text-sm text-ink/50">kcal</span>
      </div>

      <p className="mt-3 text-sm text-ink/60">{estimate.description}</p>

      <p className="mt-2 text-xs tabular-nums text-ink/50">
        P {estimate.protein_g}g · C {estimate.carbs_g}g · F {estimate.fat_g}g
      </p>

      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${CONFIDENCE_STYLES[estimate.confidence]}`}
      >
        {estimate.confidence} confidence
      </span>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="flex-1 rounded-full border border-ink/15 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => onAdd(parsedCalories)}
          disabled={isSaving || !isValid}
          className="flex-1 rounded-full bg-accent-fill py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Adding…" : "Add to log"}
        </button>
      </div>
    </div>
  );
}
