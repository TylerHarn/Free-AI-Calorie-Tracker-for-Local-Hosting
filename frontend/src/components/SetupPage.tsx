import { useState } from "react";
import { saveSetup, type ActivityLevel, type User } from "../api";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (desk job, little exercise)" },
  { value: "light", label: "Lightly active (exercise 1–3 days/week)" },
  { value: "moderate", label: "Moderately active (exercise 3–5 days/week)" },
  { value: "very_active", label: "Very active (hard exercise 6–7 days/week)" },
  { value: "extra_active", label: "Extra active (physical job or 2x/day training)" },
];

const LOSS_RATE_OPTIONS = [0.5, 1, 1.5, 2];

export default function SetupPage({ user, onComplete }: { user: User; onComplete: (user: User) => void }) {
  const [sex, setSex] = useState<"male" | "female">("female");
  const [age, setAge] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [weeklyLossRate, setWeeklyLossRate] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAge = Number(age);
    const parsedFt = Number(heightFt);
    const parsedIn = Number(heightIn);
    const parsedWeight = Number(weightLb);

    if (!parsedAge || !parsedWeight || (!parsedFt && !parsedIn)) {
      setError("Please fill in age, height, and weight.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await saveSetup({
        sex,
        age: parsedAge,
        height_ft: parsedFt,
        height_in: parsedIn,
        weight_lb: parsedWeight,
        activity_level: activityLevel,
        weekly_loss_rate_lb: weeklyLossRate,
      });
      onComplete(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Hi {user.name}, let's set your goal</h1>
          <p className="mt-1 text-sm text-slate-500">
            We'll use this to calculate a daily calorie target for weight loss.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-md">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sex</label>
            <div className="flex gap-2">
              {(["female", "male"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSex(option)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition ${
                    sex === option
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Age (years)
            </label>
            <input
              type="number"
              min={1}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Height</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min={0}
                  placeholder="ft"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min={0}
                  max={11}
                  placeholder="in"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Weight (lb)
            </label>
            <input
              type="number"
              min={1}
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Activity level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {ACTIVITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target weight-loss rate
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LOSS_RATE_OPTIONS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setWeeklyLossRate(rate)}
                  className={`rounded-lg border py-2 text-sm font-medium transition ${
                    weeklyLossRate === rate
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {rate} lb/wk
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? "Calculating..." : "Calculate my goal"}
          </button>
        </form>
      </div>
    </div>
  );
}
