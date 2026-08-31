import { useState } from "react";
import type { Meal } from "../api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface MealHistoryProps {
  meals: Meal[];
  onUpdateCalories: (id: number, calories: number) => void;
  onDelete: (id: number) => void;
}

export default function MealHistory({ meals, onUpdateCalories, onDelete }: MealHistoryProps) {
  if (meals.length === 0) {
    return <p className="text-center text-sm text-slate-400">No meals logged yet.</p>;
  }

  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {meals.map((meal) => (
        <MealRow key={meal.id} meal={meal} onUpdateCalories={onUpdateCalories} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function MealRow({
  meal,
  onUpdateCalories,
  onDelete,
}: {
  meal: Meal;
  onUpdateCalories: (id: number, calories: number) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCalories, setDraftCalories] = useState(String(meal.estimated_calories));

  function handleSave() {
    const parsed = Number(draftCalories);
    if (draftCalories.trim() !== "" && Number.isFinite(parsed) && parsed >= 0) {
      onUpdateCalories(meal.id, parsed);
    }
    setIsEditing(false);
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{meal.food_name}</p>
        <p className="text-xs text-slate-400">{formatDate(meal.created_at)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isEditing ? (
          <>
            <input
              type="number"
              min={0}
              autoFocus
              value={draftCalories}
              onChange={(e) => setDraftCalories(e.target.value)}
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSave}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftCalories(String(meal.estimated_calories));
                setIsEditing(false);
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600"
              title="Edit calories"
            >
              {meal.estimated_calories} kcal
            </button>
            <button
              type="button"
              onClick={() => onDelete(meal.id)}
              className="text-slate-300 hover:text-red-500"
              title="Delete entry"
              aria-label="Delete entry"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </li>
  );
}
