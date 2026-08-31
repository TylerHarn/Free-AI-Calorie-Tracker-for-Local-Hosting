import { useState } from "react";
import { estimateMealFromName, type Confidence, type MealEstimate } from "../api";

function parseOptionalNumber(value: string): number {
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

const DEFAULT_DESCRIPTION = "Manually logged";

export default function AddMealManually({ onAdd }: { onAdd: (entry: MealEstimate) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [confidence, setConfidence] = useState<Confidence>("manual");
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  function reset() {
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setDescription(DEFAULT_DESCRIPTION);
    setConfidence("manual");
    setEstimateError(null);
    setIsOpen(false);
  }

  async function handleEstimate() {
    const name = foodName.trim();
    if (!name) return;

    setIsEstimating(true);
    setEstimateError(null);
    try {
      const estimate = await estimateMealFromName(name);
      setCalories(String(estimate.estimated_calories));
      setProtein(String(estimate.protein_g));
      setCarbs(String(estimate.carbs_g));
      setFat(String(estimate.fat_g));
      setDescription(estimate.description);
      setConfidence(estimate.confidence);
    } catch (err) {
      setEstimateError(err instanceof Error ? err.message : "Could not estimate that food.");
    } finally {
      setIsEstimating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedCalories = Number(calories);
    if (!foodName.trim() || !Number.isFinite(parsedCalories) || parsedCalories < 0) return;

    onAdd({
      food_name: foodName.trim(),
      description,
      estimated_calories: parsedCalories,
      confidence,
      protein_g: parseOptionalNumber(protein),
      carbs_g: parseOptionalNumber(carbs),
      fat_g: parseOptionalNumber(fat),
    });

    reset();
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
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Food name"
          value={foodName}
          onChange={(e) => {
            setFoodName(e.target.value);
            setEstimateError(null);
          }}
          autoFocus
          className="flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 font-sans text-sm focus:border-ember focus:outline-none"
        />
        <button
          type="button"
          onClick={handleEstimate}
          disabled={isEstimating || !foodName.trim()}
          className="shrink-0 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 font-sans text-xs font-semibold text-ember transition hover:bg-ember/15 disabled:opacity-50"
        >
          {isEstimating ? "Estimating…" : "✨ Estimate"}
        </button>
      </div>

      {estimateError && <p className="font-sans text-xs text-rust">{estimateError}</p>}

      <input
        type="number"
        min={0}
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-ember focus:outline-none"
      />

      <div>
        <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-ink/40">Macros (optional)</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Protein g"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-ember focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder="Carbs g"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-ember focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder="Fat g"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-ember focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={reset}
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
