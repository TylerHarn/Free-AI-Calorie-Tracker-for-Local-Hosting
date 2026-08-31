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
    return <p className="py-4 text-center font-sans text-sm text-ink/40">No meals logged yet.</p>;
  }

  return (
    <ul>
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
    <li className="flex items-center gap-3 border-b border-dotted border-ink/20 py-3 first:pt-0 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm text-ink">{meal.food_name}</p>
        <p className="font-mono text-[11px] text-ink/40">{formatDate(meal.created_at)}</p>
      </div>

      {isEditing ? (
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="number"
            min={0}
            autoFocus
            value={draftCalories}
            onChange={(e) => setDraftCalories(e.target.value)}
            className="w-20 rounded-md border border-ink/20 bg-paper px-2 py-1 text-right font-mono text-sm focus:border-ember focus:outline-none"
          />
          <button type="button" onClick={handleSave} className="font-sans text-xs font-semibold text-sage">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setDraftCalories(String(meal.estimated_calories));
              setIsEditing(false);
            }}
            className="font-sans text-xs font-medium text-ink/40"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="min-h-11 rounded-lg px-2 font-mono text-sm font-semibold text-ink tabular-nums hover:text-ember"
            title="Edit calories"
          >
            {meal.estimated_calories}
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal.id)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-ink/30 hover:bg-rust/10 hover:text-rust"
            title="Delete entry"
            aria-label="Delete entry"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
}
