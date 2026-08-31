import { useState } from "react";
import type { MealEstimate } from "../api";

export default function AddMealManually({ onAdd }: { onAdd: (entry: MealEstimate) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedCalories = Number(calories);
    if (!foodName.trim() || !Number.isFinite(parsedCalories) || parsedCalories < 0) return;

    onAdd({
      food_name: foodName.trim(),
      description: "Manually logged",
      estimated_calories: parsedCalories,
      confidence: "manual",
    });

    setFoodName("");
    setCalories("");
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600"
      >
        + Add food manually
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="text"
        placeholder="Food name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
        autoFocus
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />
      <input
        type="number"
        min={0}
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!foodName.trim() || calories.trim() === ""}
          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
