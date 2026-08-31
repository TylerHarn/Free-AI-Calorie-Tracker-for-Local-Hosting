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
        className="w-full py-2 text-center font-sans text-sm font-medium text-ink/50 underline decoration-dotted underline-offset-4 hover:text-ember"
      >
        + Add a food by hand
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl border border-ink/10 bg-paper-raised p-4">
      <input
        type="text"
        placeholder="Food name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
        autoFocus
        className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-sans text-sm focus:border-ember focus:outline-none"
      />
      <input
        type="number"
        min={0}
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-ember focus:outline-none"
      />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 rounded-full border border-ink/15 py-2 font-sans text-sm font-medium text-ink/70 hover:bg-ink/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!foodName.trim() || calories.trim() === ""}
          className="flex-1 rounded-full bg-ember py-2 font-sans text-sm font-semibold text-paper-raised transition hover:bg-ember/90 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
