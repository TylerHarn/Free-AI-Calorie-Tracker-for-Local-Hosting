import { useState } from "react";
import type { Meal, Workout } from "../api";

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className="h-4 w-4">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Macros {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface DailyLogProps {
  meals: Meal[];
  workouts: Workout[];
  onUpdateMealCalories: (id: number, calories: number) => void;
  onUpdateMealMacros: (id: number, macros: Macros) => void;
  onDeleteMeal: (id: number) => void;
  onSaveFavorite: (meal: Meal) => void;
  onUpdateWorkoutCalories: (id: number, calories: number) => void;
  onDeleteWorkout: (id: number) => void;
}

type Entry =
  | { kind: "meal"; id: number; name: string; calories: number; macros: Macros; created_at: string; raw: Meal }
  | { kind: "workout"; id: number; name: string; calories: number; macros: null; created_at: string };

export default function DailyLog({
  meals,
  workouts,
  onUpdateMealCalories,
  onUpdateMealMacros,
  onDeleteMeal,
  onSaveFavorite,
  onUpdateWorkoutCalories,
  onDeleteWorkout,
}: DailyLogProps) {
  const entries: Entry[] = [
    ...meals.map(
      (meal): Entry => ({
        kind: "meal",
        id: meal.id,
        name: meal.food_name,
        calories: meal.estimated_calories,
        macros: { protein_g: meal.protein_g, carbs_g: meal.carbs_g, fat_g: meal.fat_g },
        created_at: meal.created_at,
        raw: meal,
      })
    ),
    ...workouts.map(
      (workout): Entry => ({
        kind: "workout",
        id: workout.id,
        name: workout.activity_name,
        calories: workout.calories_burned,
        macros: null,
        created_at: workout.created_at,
      })
    ),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (entries.length === 0) {
    return <p className="py-4 text-center text-sm text-ink/40">Nothing logged yet.</p>;
  }

  return (
    <ul>
      {entries.map((entry) => (
        <LogRow
          key={`${entry.kind}-${entry.id}`}
          entry={entry}
          onUpdateCalories={entry.kind === "meal" ? onUpdateMealCalories : onUpdateWorkoutCalories}
          onUpdateMacros={entry.kind === "meal" ? onUpdateMealMacros : undefined}
          onDelete={entry.kind === "meal" ? onDeleteMeal : onDeleteWorkout}
          onSaveFavorite={entry.kind === "meal" ? () => onSaveFavorite(entry.raw) : undefined}
        />
      ))}
    </ul>
  );
}

function LogRow({
  entry,
  onUpdateCalories,
  onUpdateMacros,
  onDelete,
  onSaveFavorite,
}: {
  entry: Entry;
  onUpdateCalories: (id: number, calories: number) => void;
  onUpdateMacros?: (id: number, macros: Macros) => void;
  onDelete: (id: number) => void;
  onSaveFavorite?: () => void;
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
    <li className="flex gap-3 border-b border-ink/10 py-3 first:pt-0 last:border-b-0">
      <span
        aria-hidden="true"
        className={`h-8 w-1 shrink-0 self-center rounded-full ${isWorkout ? "bg-workout/50" : "bg-accent/50"}`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-sm ${isWorkout ? "text-workout" : "text-ink"}`}>{entry.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="text-xs text-ink/40">{formatDate(entry.created_at)}</span>
              {entry.kind === "meal" && onUpdateMacros && (
                <>
                  <span className="text-xs text-ink/25">·</span>
                  <MacroLine id={entry.id} macros={entry.macros} onUpdateMacros={onUpdateMacros} />
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="flex shrink-0 items-center gap-2">
              <input
                type="number"
                min={0}
                autoFocus
                value={draftCalories}
                onChange={(e) => setDraftCalories(e.target.value)}
                className="w-20 rounded-md border border-ink/20 bg-paper px-2 py-1 text-right text-sm tabular-nums focus:border-accent focus:outline-none"
              />
              <button type="button" onClick={handleSave} className="text-xs font-semibold text-success">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftCalories(String(entry.calories));
                  setIsEditing(false);
                }}
                className="text-xs font-medium text-ink/40"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`min-h-11 rounded-lg px-2 text-sm font-semibold tabular-nums ${
                  isWorkout ? "text-workout hover:text-workout/70" : "text-ink hover:text-accent"
                }`}
                title="Edit calories"
              >
                {isWorkout ? `−${entry.calories}` : entry.calories}
              </button>
              {onSaveFavorite && (
                <button
                  type="button"
                  onClick={onSaveFavorite}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink/25 hover:bg-accent/10 hover:text-accent"
                  title="Save as favorite"
                  aria-label="Save as favorite"
                >
                  <StarIcon />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/25 hover:bg-danger/10 hover:text-danger"
                title="Delete entry"
                aria-label="Delete entry"
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function MacroLine({
  id,
  macros,
  onUpdateMacros,
}: {
  id: number;
  macros: Macros;
  onUpdateMacros: (id: number, macros: Macros) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    protein_g: String(macros.protein_g),
    carbs_g: String(macros.carbs_g),
    fat_g: String(macros.fat_g),
  });

  function parsed(value: string) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function handleSave() {
    onUpdateMacros(id, {
      protein_g: parsed(draft.protein_g),
      carbs_g: parsed(draft.carbs_g),
      fat_g: parsed(draft.fat_g),
    });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="mt-1 flex w-full basis-full flex-wrap items-center gap-1.5">
        <input
          type="number"
          min={0}
          autoFocus
          value={draft.protein_g}
          onChange={(e) => setDraft((d) => ({ ...d, protein_g: e.target.value }))}
          placeholder="P"
          className="w-14 rounded-md border border-ink/20 bg-paper px-1.5 py-1 text-center text-xs tabular-nums focus:border-accent focus:outline-none"
        />
        <input
          type="number"
          min={0}
          value={draft.carbs_g}
          onChange={(e) => setDraft((d) => ({ ...d, carbs_g: e.target.value }))}
          placeholder="C"
          className="w-14 rounded-md border border-ink/20 bg-paper px-1.5 py-1 text-center text-xs tabular-nums focus:border-accent focus:outline-none"
        />
        <input
          type="number"
          min={0}
          value={draft.fat_g}
          onChange={(e) => setDraft((d) => ({ ...d, fat_g: e.target.value }))}
          placeholder="F"
          className="w-14 rounded-md border border-ink/20 bg-paper px-1.5 py-1 text-center text-xs tabular-nums focus:border-accent focus:outline-none"
        />
        <button type="button" onClick={handleSave} className="text-xs font-semibold text-success">
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft({
              protein_g: String(macros.protein_g),
              carbs_g: String(macros.carbs_g),
              fat_g: String(macros.fat_g),
            });
            setIsEditing(false);
          }}
          className="text-xs font-medium text-ink/40"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="text-xs font-medium tabular-nums text-accent/80 hover:text-accent"
    >
      P {macros.protein_g}g · C {macros.carbs_g}g · F {macros.fat_g}g
    </button>
  );
}
