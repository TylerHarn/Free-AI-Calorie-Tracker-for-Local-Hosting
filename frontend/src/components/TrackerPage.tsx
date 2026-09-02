import { useEffect, useState } from "react";
import {
  addFavorite,
  addMeal,
  addWorkout,
  deleteFavorite,
  deleteMeal,
  deleteWorkout,
  estimateMeal,
  estimateWorkout,
  getFavorites,
  getMealHistory,
  getWorkoutHistory,
  logout,
  updateMealCalories,
  updateMealMacros,
  updateWorkoutCalories,
  type Favorite,
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
import MacroSummary from "./MacroSummary";
import PhotoCapture from "./PhotoCapture";
import ProgressBar from "./ProgressBar";
import QuickActionsGrid, { type QuickAction } from "./QuickActionsGrid";
import QuickAddFavorites from "./QuickAddFavorites";
import ScanBarcode from "./ScanBarcode";
import SettingsMenu from "./SettingsMenu";
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

export default function TrackerPage({
  user,
  onSignOut,
  onEditGoal,
  onShowProgress,
}: {
  user: User;
  onSignOut: () => void;
  onEditGoal: () => void;
  onShowProgress: () => void;
}) {
  const [pendingEstimate, setPendingEstimate] = useState<MealEstimate | null>(null);
  const [history, setHistory] = useState<Meal[]>([]);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);
  const [activeAction, setActiveAction] = useState<QuickAction | null>(null);

  const [pendingWorkout, setPendingWorkout] = useState<WorkoutEstimate | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isEstimatingWorkout, setIsEstimatingWorkout] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMealHistory()
      .then(setHistory)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your meal history."));
    getWorkoutHistory()
      .then(setWorkouts)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your workout history."));
    getFavorites()
      .then(setFavorites)
      .catch(() => {
        // favorites are a nice-to-have; ignore load failures
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

  async function handleUpdateMacros(id: number, macros: { protein_g: number; carbs_g: number; fat_g: number }) {
    const previous = history;
    setHistory((prev) => prev.map((meal) => (meal.id === id ? { ...meal, ...macros } : meal)));
    try {
      await updateMealMacros(id, macros);
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

  async function handleSaveFavorite(meal: Meal) {
    try {
      const favorite = await addFavorite({
        food_name: meal.food_name,
        description: meal.description,
        estimated_calories: meal.estimated_calories,
        confidence: meal.confidence,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
      });
      setFavorites((prev) => [favorite, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleDeleteFavorite(id: number) {
    const previous = favorites;
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteFavorite(id);
    } catch (err) {
      setFavorites(previous);
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

  const mealsToday = history.filter((meal) => isToday(meal.created_at));
  const proteinToday = mealsToday.reduce((sum, meal) => sum + meal.protein_g, 0);
  const carbsToday = mealsToday.reduce((sum, meal) => sum + meal.carbs_g, 0);
  const fatToday = mealsToday.reduce((sum, meal) => sum + meal.fat_g, 0);

  const totalItems = history.length + workouts.length;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-16">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40">Calorie Tracker</p>
          <h1 className="font-display text-2xl font-medium text-ink">{user.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowProgress}
            aria-label="View progress"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition hover:border-ink/30 hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <polyline
                points="23 6 13.5 15.5 8.5 10.5 1 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="17 6 23 6 23 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <SettingsMenu onEditGoal={onEditGoal} onSignOut={handleSignOut} />
        </div>
      </header>

      {user.daily_calorie_goal != null && (
        <div className="mb-6">
          <ProgressBar consumed={consumedToday} burned={burnedToday} goal={user.daily_calorie_goal} />
        </div>
      )}

      <div className="mb-8">
        <MacroSummary protein={proteinToday} carbs={carbsToday} fat={fatToday} />
      </div>

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

      <div className="mb-6">
        {activeAction === null && <QuickActionsGrid onSelect={setActiveAction} />}

        {activeAction === "manual" && (
          <AddMealManually onAdd={handleAddEntry} onClose={() => setActiveAction(null)} />
        )}

        {activeAction === "barcode" && (
          <ScanBarcode onFound={setPendingEstimate} onClose={() => setActiveAction(null)} />
        )}

        {activeAction === "favorites" && (
          <QuickAddFavorites
            favorites={favorites}
            onAdd={handleAddEntry}
            onDelete={handleDeleteFavorite}
            onClose={() => setActiveAction(null)}
          />
        )}

        {activeAction === "workout" && (
          <LogWorkoutForm
            onEstimate={handleEstimateWorkout}
            isEstimating={isEstimatingWorkout}
            onClose={() => setActiveAction(null)}
          />
        )}
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
            onUpdateMealMacros={handleUpdateMacros}
            onSaveFavorite={handleSaveFavorite}
            onDeleteMeal={handleDelete}
            onUpdateWorkoutCalories={handleUpdateWorkoutCalories}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </div>
      </section>
    </div>
  );
}
