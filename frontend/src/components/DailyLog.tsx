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
    return <p className="py-4 text-center font-sans text-sm text-ink/40">Nothing logged yet.</p>;
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
    <li className="border-b border-dotted border-ink/20 py-3 first:pt-0 last:border-b-0">
      <div className="flex items-center gap-3">
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
            {onSaveFavorite && (
              <button
                type="button"
                onClick={onSaveFavorite}
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-ink/30 hover:bg-ember/10 hover:text-ember"
                title="Save as favorite"
                aria-label="Save as favorite"
              >
                ☆
              </button>
            )}
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
      </div>

      {entry.kind === "meal" && onUpdateMacros && (
        <MacroLine id={entry.id} macros={entry.macros} onUpdateMacros={onUpdateMacros} />
      )}
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
      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          autoFocus
          value={draft.protein_g}
          onChange={(e) => setDraft((d) => ({ ...d, protein_g: e.target.value }))}
          placeholder="P"
          className="w-14 rounded-md border border-ink/20 bg-paper px-1.5 py-1 text-center font-mono text-xs focus:border-ember focus:outline-none"
        />
        <input
          type="number"
          min={0}
          value={draft.carbs_g}
          onChange={(e) => setDraft((d) => ({ ...d, carbs_g: e.target.value }))}
          placeholder="C"
          className="w-14 rounded-md border border-ink/20 bg-paper px-1.5 py-1 text-center font-mono text-xs focus:border-ember focus:outline-none"
        />
        <input
          type="number"
          min={0}
          value={draft.fat_g}
          onChange={(e) => setDraft((d) => ({ ...d, fat_g: e.target.value }))}
          placeholder="F"
          className="w-14 rounded-md border border-ink/20 bg-paper px-1.5 py-1 text-center font-mono text-xs focus:border-ember focus:outline-none"
        />
        <button type="button" onClick={handleSave} className="font-sans text-xs font-semibold text-sage">
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
          className="font-sans text-xs font-medium text-ink/40"
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
      className="mt-1 block font-mono text-[11px] text-ink/45 hover:text-ember"
    >
      P {macros.protein_g}g · C {macros.carbs_g}g · F {macros.fat_g}g
    </button>
  );
}
