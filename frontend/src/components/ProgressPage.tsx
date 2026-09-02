import { useEffect, useState } from "react";
import {
  addWeighIn,
  deleteWeighIn,
  getMealHistory,
  getWeighIns,
  getWorkoutHistory,
  updateWeighIn,
  type Meal,
  type User,
  type WeighIn,
  type Workout,
} from "../api";
import CalorieHistoryChart, { type DaySummary } from "./CalorieHistoryChart";
import WeightChart from "./WeightChart";

const HISTORY_DAYS = 14;

function localDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dateLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ProgressPage({ user, onBack }: { user: User; onBack: () => void }) {
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWeighIns()
      .then(setWeighIns)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load weigh-ins."));
    getMealHistory()
      .then(setMeals)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load meal history."));
    getWorkoutHistory()
      .then(setWorkouts)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load workout history."));
  }, []);

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(newWeight);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    try {
      const weighIn = await addWeighIn(parsed);
      setWeighIns((prev) => [weighIn, ...prev]);
      setNewWeight("");
      setIsAddingWeight(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleDeleteWeighIn(id: number) {
    const previous = weighIns;
    setWeighIns((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteWeighIn(id);
    } catch (err) {
      setWeighIns(previous);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const dayKeys: string[] = [];
  const dayDates: Date[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayKeys.push(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    dayDates.push(d);
  }

  const netByDay = new Map<string, number>();
  for (const meal of meals) {
    const key = localDateKey(meal.created_at);
    netByDay.set(key, (netByDay.get(key) ?? 0) + meal.estimated_calories);
  }
  for (const workout of workouts) {
    const key = localDateKey(workout.created_at);
    netByDay.set(key, (netByDay.get(key) ?? 0) - workout.calories_burned);
  }

  const daySummaries: DaySummary[] = dayKeys.map((key, i) => ({
    dateLabel: dateLabel(dayDates[i]),
    net: Math.max(0, netByDay.get(key) ?? 0),
  }));

  const latestWeight = weighIns[0]?.weight_lb ?? null;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-16">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to tracker"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition hover:border-ink/30 hover:text-ink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p className="font-mono text-[11px] tracking-wide text-ink/40">{user.name}</p>
          <h1 className="font-display text-2xl font-medium text-ink">Progress</h1>
        </div>
      </header>

      {error && <p className="mb-4 rounded-xl bg-rust/10 p-3 text-center font-sans text-sm text-rust">{error}</p>}

      <section className="mb-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-[11px] tracking-wide text-ink/40">Weight</h2>
          {latestWeight != null && (
            <span className="font-mono text-sm font-semibold text-ink">{latestWeight}lb</span>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-paper-raised p-4">
          <WeightChart weighIns={weighIns} goalWeightLb={user.goal_weight_lb} />
        </div>

        <div className="mt-3">
          {isAddingWeight ? (
            <form onSubmit={handleAddWeight} className="flex gap-2 rounded-2xl border border-ink/10 bg-paper-raised p-3">
              <input
                type="number"
                min={1}
                autoFocus
                placeholder="Weight (lb)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-ember focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsAddingWeight(false);
                  setNewWeight("");
                }}
                className="rounded-full border border-ink/15 px-4 py-2 font-sans text-sm font-medium text-ink/70 hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={newWeight.trim() === ""}
                className="rounded-full bg-ember px-4 py-2 font-sans text-sm font-semibold text-cream transition hover:bg-ember/90 disabled:opacity-50"
              >
                Log
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingWeight(true)}
              className="w-full py-2 text-center font-sans text-sm font-medium text-ink/50 underline decoration-dotted underline-offset-4 hover:text-ember"
            >
              + Log weight
            </button>
          )}
        </div>

        {weighIns.length > 0 && (
          <ul className="mt-3 rounded-2xl border border-ink/10 bg-paper-raised px-4">
            {weighIns.map((weighIn) => (
              <WeighInRow key={weighIn.id} weighIn={weighIn} onDelete={handleDeleteWeighIn} onUpdate={setWeighIns} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-mono text-[11px] tracking-wide text-ink/40">
          Last {HISTORY_DAYS} days
        </h2>
        <div className="rounded-2xl border border-ink/10 bg-paper-raised p-4">
          {user.daily_calorie_goal != null && <CalorieHistoryChart days={daySummaries} goal={user.daily_calorie_goal} />}
        </div>
      </section>
    </div>
  );
}

function WeighInRow({
  weighIn,
  onDelete,
  onUpdate,
}: {
  weighIn: WeighIn;
  onDelete: (id: number) => void;
  onUpdate: (updater: (prev: WeighIn[]) => WeighIn[]) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(weighIn.weight_lb));

  async function handleSave() {
    const parsed = Number(draft);
    if (Number.isFinite(parsed) && parsed > 0) {
      try {
        const updated = await updateWeighIn(weighIn.id, parsed);
        onUpdate((prev) => prev.map((w) => (w.id === weighIn.id ? updated : w)));
      } catch {
        // leave the previous value in place on failure
      }
    }
    setIsEditing(false);
  }

  return (
    <li className="flex items-center gap-3 border-b border-dotted border-ink/20 py-3 first:pt-0 last:border-b-0">
      <p className="flex-1 font-mono text-[11px] text-ink/40">
        {new Date(weighIn.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </p>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-20 rounded-md border border-ink/20 bg-paper px-2 py-1 text-right font-mono text-sm focus:border-ember focus:outline-none"
          />
          <button type="button" onClick={handleSave} className="font-sans text-xs font-semibold text-sage">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(String(weighIn.weight_lb));
              setIsEditing(false);
            }}
            className="font-sans text-xs font-medium text-ink/40"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="min-h-11 rounded-lg px-2 font-mono text-sm font-semibold text-ink hover:text-ember"
          >
            {weighIn.weight_lb}lb
          </button>
          <button
            type="button"
            onClick={() => onDelete(weighIn.id)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-ink/30 hover:bg-rust/10 hover:text-rust"
            aria-label="Delete weigh-in"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
}
