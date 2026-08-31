import { useEffect, useState } from "react";
import {
  addMeal,
  addWorkout,
  deleteMeal,
  deleteWorkout,
  estimateMeal,
  estimateWorkout,
  getMealHistory,
  getWorkoutHistory,
  logout,
  updateMealCalories,
  updateWorkoutCalories,
  type Meal,
  type MealEstimate,
  type User,
  type Workout,
  type WorkoutEstimate,
} from "../api";
import AddMealManually from "./AddMealManually";
import CalorieResult from "./CalorieResult";
import DailyLog from "./DailyLog";
import LogWorkoutForm from "./LogWorkoutForm";
import PhotoCapture from "./PhotoCapture";
import ProgressBar from "./ProgressBar";
import WorkoutResult from "./WorkoutResult";

function isToday(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function TrackerPage({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [pendingEstimate, setPendingEstimate] = useState<MealEstimate | null>(null);
  const [history, setHistory] = useState<Meal[]>([]);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);

  const [pendingWorkout, setPendingWorkout] = useState<WorkoutEstimate | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isEstimatingWorkout, setIsEstimatingWorkout] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMealHistory()
      .then(setHistory)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your meal history."));
    getWorkoutHistory()
      .then(setWorkouts)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your workout history."));
  }, []);

  async function handleEstimate(image: Blob) {
    setIsEstimating(true);
    setError(null);
    setPendingEstimate(null);
    try {
      const estimate = await estimateMeal(image);
      setPendingEstimate(estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsEstimating(false);
    }
  }

  async function handleAddEntry(entry: MealEstimate) {
    setIsSavingEstimate(true);
    setError(null);
    try {
      const meal = await addMeal(entry);
      setHistory((prev) => [meal, ...prev]);
      setPendingEstimate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSavingEstimate(false);
    }
  }

  async function handleUpdateCalories(id: number, calories: number) {
    const previous = history;
    setHistory((prev) => prev.map((meal) => (meal.id === id ? { ...meal, estimated_calories: calories } : meal)));
    try {
      await updateMealCalories(id, calories);
    } catch (err) {
      setHistory(previous);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleDelete(id: number) {
    const previous = history;
    setHistory((prev) => prev.filter((meal) => meal.id !== id));
    try {
      await deleteMeal(id);
    } catch (err) {
      setHistory(previous);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleEstimateWorkout(activity: string, durationMinutes: number) {
    setIsEstimatingWorkout(true);
    setError(null);
    setPendingWorkout(null);
    try {
      const estimate = await estimateWorkout(activity, durationMinutes);
      setPendingWorkout(estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsEstimatingWorkout(false);
    }
  }

  async function handleAddWorkoutEntry(entry: WorkoutEstimate) {
    setIsSavingWorkout(true);
    setError(null);
    try {
      const workout = await addWorkout(entry);
      setWorkouts((prev) => [workout, ...prev]);
      setPendingWorkout(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSavingWorkout(false);
    }
  }

  async function handleUpdateWorkoutCalories(id: number, calories: number) {
    const previous = workouts;
    setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, calories_burned: calories } : w)));
    try {
      await updateWorkoutCalories(id, calories);
    } catch (err) {
      setWorkouts(previous);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleDeleteWorkout(id: number) {
    const previous = workouts;
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteWorkout(id);
    } catch (err) {
      setWorkouts(previous);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleSignOut() {
    await logout().catch(() => {});
    onSignOut();
  }

  const consumedToday = history
    .filter((meal) => isToday(meal.created_at))
    .reduce((sum, meal) => sum + meal.estimated_calories, 0);

  const burnedToday = workouts
    .filter((workout) => isToday(workout.created_at))
    .reduce((sum, workout) => sum + workout.calories_burned, 0);

  const totalItems = history.length + workouts.length;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-16">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40">Calorie Tracker</p>
          <h1 className="font-display text-2xl font-medium text-ink">{user.name}</h1>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-ink/15 px-3 py-1.5 font-sans text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
        >
          Switch
        </button>
      </header>

      {user.daily_calorie_goal != null && (
        <div className="mb-8">
          <ProgressBar consumed={consumedToday} burned={burnedToday} goal={user.daily_calorie_goal} />
        </div>
      )}

      <div className="mb-6">
        <PhotoCapture onEstimate={handleEstimate} isEstimating={isEstimating} />
      </div>

      {error && <p className="mb-4 rounded-xl bg-rust/10 p-3 text-center font-sans text-sm text-rust">{error}</p>}

      {pendingEstimate && (
        <div className="mb-6">
          <CalorieResult
            estimate={pendingEstimate}
            onAdd={(calories) => handleAddEntry({ ...pendingEstimate, estimated_calories: calories })}
            onDiscard={() => setPendingEstimate(null)}
            isSaving={isSavingEstimate}
          />
        </div>
      )}

      <div className="mb-3">
        <AddMealManually onAdd={handleAddEntry} />
      </div>

      <div className="mb-6">
        <LogWorkoutForm onEstimate={handleEstimateWorkout} isEstimating={isEstimatingWorkout} />
      </div>

      {pendingWorkout && (
        <div className="mb-6">
          <WorkoutResult
            estimate={pendingWorkout}
            onAdd={(caloriesBurned) => handleAddWorkoutEntry({ ...pendingWorkout, calories_burned: caloriesBurned })}
            onDiscard={() => setPendingWorkout(null)}
            isSaving={isSavingWorkout}
          />
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink/40">Today's ticket</h2>
          <span className="font-mono text-[11px] text-ink/40">
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </span>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-paper-raised px-4">
          <DailyLog
            meals={history}
            workouts={workouts}
            onUpdateMealCalories={handleUpdateCalories}
            onDeleteMeal={handleDelete}
            onUpdateWorkoutCalories={handleUpdateWorkoutCalories}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </div>
      </section>
    </div>
  );
}
