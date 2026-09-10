import { useState } from "react";
import type { WorkoutEstimate } from "../api";

export default function WorkoutResult({
  estimate,
  onAdd,
  onDiscard,
  isSaving,
}: {
  estimate: WorkoutEstimate;
  onAdd: (caloriesBurned: number) => void;
  onDiscard: () => void;
  isSaving: boolean;
}) {
  const [calories, setCalories] = useState(String(estimate.calories_burned));

  const parsedCalories = Number(calories);
  const isValid = calories.trim() !== "" && Number.isFinite(parsedCalories) && parsedCalories >= 0;

  return (
    <div className="rounded-2xl border border-workout/30 bg-paper-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-workout/80">Workout logged</p>
      <p className="mt-1 text-xl font-semibold text-ink">{estimate.activity_name}</p>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-workout">−</span>
        <input
          type="number"
          min={0}
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-28 rounded-lg border border-workout/25 bg-paper px-2 py-1 text-3xl font-bold tabular-nums text-workout focus:border-workout focus:outline-none"
        />
        <span className="text-sm text-ink/50">kcal burned</span>
      </div>

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
          className="flex-1 rounded-full bg-workout-fill py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Adding…" : "Add to log"}
        </button>
      </div>
    </div>
  );
}
