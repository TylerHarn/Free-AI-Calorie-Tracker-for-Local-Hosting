import { useState } from "react";
import type { Meal, Workout } from "../api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface DailyLogProps {
  meals: Meal[];
  workouts: Workout[];
  onUpdateMealCalories: (id: number, calories: number) => void;
  onDeleteMeal: (id: number) => void;
  onUpdateWorkoutCalories: (id: number, calories: number) => void;
  onDeleteWorkout: (id: number) => void;
}

type Entry =
  | { kind: "meal"; id: number; name: string; calories: number; created_at: string }
  | { kind: "workout"; id: number; name: string; calories: number; created_at: string };

export default function DailyLog({
  meals,
  workouts,
  onUpdateMealCalories,
  onDeleteMeal,
  onUpdateWorkoutCalories,
  onDeleteWorkout,
}: DailyLogProps) {
  const entries: Entry[] = [
    ...meals.map((meal): Entry => ({
      kind: "meal",
      id: meal.id,
      name: meal.food_name,
      calories: meal.estimated_calories,
      created_at: meal.created_at,
    })),
    ...workouts.map((workout): Entry => ({
      kind: "workout",
      id: workout.id,
      name: workout.activity_name,
      calories: workout.calories_burned,
      created_at: workout.created_at,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (entries.length === 0) {
    return <p className="py-4 text-center font-sans text-sm text-ink/40">Nothing logged yet.</p>;
  }

  return (
    <ul>
      {entries.map((entry) => (
        <LogRow
          key={`${entry.kind}-${entry.id}`}
          entry={entry}
          onUpdateCalories={entry.kind === "meal" ? onUpdateMealCalories : onUpdateWorkoutCalories}
          onDelete={entry.kind === "meal" ? onDeleteMeal : onDeleteWorkout}
        />
      ))}
    </ul>
  );
}

function LogRow({
  entry,
  onUpdateCalories,
  onDelete,
}: {
  entry: Entry;
  onUpdateCalories: (id: number, calories: number) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCalories, setDraftCalories] = useState(String(entry.calories));
  const isWorkout = entry.kind === "workout";

  function handleSave() {
    const parsed = Number(draftCalories);
    if (draftCalories.trim() !== "" && Number.isFinite(parsed) && parsed >= 0) {
      onUpdateCalories(entry.id, parsed);
    }
    setIsEditing(false);
  }

  return (
    <li className="flex items-center gap-3 border-b border-dotted border-ink/20 py-3 first:pt-0 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className={`truncate font-sans text-sm ${isWorkout ? "text-steel" : "text-ink"}`}>{entry.name}</p>
        <p className="font-mono text-[11px] text-ink/40">{formatDate(entry.created_at)}</p>
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
              setDraftCalories(String(entry.calories));
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
            className={`min-h-11 rounded-lg px-2 font-mono text-sm font-semibold tabular-nums ${
              isWorkout ? "text-steel hover:text-steel/70" : "text-ink hover:text-ember"
            }`}
            title="Edit calories"
          >
            {isWorkout ? `−${entry.calories}` : entry.calories}
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
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
