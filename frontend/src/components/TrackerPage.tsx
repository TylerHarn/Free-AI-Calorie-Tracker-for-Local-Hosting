import { useEffect, useState } from "react";
import {
  addMeal,
  deleteMeal,
  estimateMeal,
  getMealHistory,
  logout,
  updateMealCalories,
  type Meal,
  type MealEstimate,
  type User,
} from "../api";
import AddMealManually from "./AddMealManually";
import CalorieResult from "./CalorieResult";
import MealHistory from "./MealHistory";
import PhotoCapture from "./PhotoCapture";
import ProgressBar from "./ProgressBar";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMealHistory()
      .then(setHistory)
      .catch(() => {
        // history is a nice-to-have; ignore load failures on first render
      });
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

  async function handleSignOut() {
    await logout().catch(() => {});
    onSignOut();
  }

  const consumedToday = history
    .filter((meal) => isToday(meal.created_at))
    .reduce((sum, meal) => sum + meal.estimated_calories, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md space-y-8">
        <header className="text-center">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Hi, {user.name}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Switch user
            </button>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Calorie Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Snap a photo of your meal and get an instant calorie estimate.</p>
        </header>

        {user.daily_calorie_goal != null && <ProgressBar consumed={consumedToday} goal={user.daily_calorie_goal} />}

        <section className="rounded-2xl bg-white p-6 shadow-md">
          <PhotoCapture onEstimate={handleEstimate} isEstimating={isEstimating} />
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>
        )}

        {pendingEstimate && (
          <CalorieResult
            estimate={pendingEstimate}
            onAdd={(calories) => handleAddEntry({ ...pendingEstimate, estimated_calories: calories })}
            onDiscard={() => setPendingEstimate(null)}
            isSaving={isSavingEstimate}
          />
        )}

        <AddMealManually onAdd={handleAddEntry} />

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">History</h2>
          <MealHistory meals={history} onUpdateCalories={handleUpdateCalories} onDelete={handleDelete} />
        </section>
      </div>
    </div>
  );
}
