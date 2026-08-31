import { useEffect, useState } from "react";
import { estimateMeal, getMealHistory, type Meal } from "./api";
import CalorieResult from "./components/CalorieResult";
import MealHistory from "./components/MealHistory";
import PhotoCapture from "./components/PhotoCapture";

export default function App() {
  const [result, setResult] = useState<Meal | null>(null);
  const [history, setHistory] = useState<Meal[]>([]);
  const [isEstimating, setIsEstimating] = useState(false);
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
    setResult(null);
    try {
      const meal = await estimateMeal(image);
      setResult(meal);
      setHistory((prev) => [meal, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsEstimating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Calorie Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Snap a photo of your meal and get an instant calorie estimate.</p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-md">
          <PhotoCapture onEstimate={handleEstimate} isEstimating={isEstimating} />
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>
        )}

        {result && <CalorieResult meal={result} />}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">History</h2>
          <MealHistory meals={history} />
        </section>
      </div>
    </div>
  );
}
