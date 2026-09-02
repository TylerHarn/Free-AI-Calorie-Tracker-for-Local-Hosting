import { useState } from "react";
import { saveSetup, type ActivityLevel, type User } from "../api";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary — desk job, little exercise" },
  { value: "light", label: "Lightly active — exercise 1–3 days/week" },
  { value: "moderate", label: "Moderately active — exercise 3–5 days/week" },
  { value: "very_active", label: "Very active — hard exercise 6–7 days/week" },
  { value: "extra_active", label: "Extra active — physical job or 2x/day training" },
];

const LOSS_RATE_OPTIONS = [0.5, 1, 1.5, 2];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-ink/40">{children}</label>;
}

function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  let ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - ft * 12);
  if (inches === 12) {
    ft += 1;
    inches = 0;
  }
  return { ft, inches };
}

function kgToLb(kg: number): number {
  return Math.round(kg / 0.45359237);
}

export default function SetupPage({
  user,
  onComplete,
  onCancel,
}: {
  user: User;
  onComplete: (user: User) => void;
  onCancel?: () => void;
}) {
  const isEditing = user.daily_calorie_goal != null;
  const prefillHeight = user.height_cm != null ? cmToFtIn(user.height_cm) : null;

  const [sex, setSex] = useState<"male" | "female">(user.sex ?? "female");
  const [age, setAge] = useState(user.age != null ? String(user.age) : "");
  const [heightFt, setHeightFt] = useState(prefillHeight ? String(prefillHeight.ft) : "");
  const [heightIn, setHeightIn] = useState(prefillHeight ? String(prefillHeight.inches) : "");
  const [weightLb, setWeightLb] = useState(user.weight_kg != null ? String(kgToLb(user.weight_kg)) : "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>((user.activity_level as ActivityLevel) ?? "moderate");
  const [weeklyLossRate, setWeeklyLossRate] = useState(user.weekly_loss_rate_lb ?? 1);
  const [goalWeightLb, setGoalWeightLb] = useState(user.goal_weight_lb != null ? String(user.goal_weight_lb) : "");
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

    const parsedGoalWeight = goalWeightLb.trim() === "" ? undefined : Number(goalWeightLb);

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
        goal_weight_lb: parsedGoalWeight,
      });
      onComplete(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-screen flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))]"
    >
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-wide text-ink/40">Order form</p>
          {isEditing && onCancel && (
            <button type="button" onClick={onCancel} className="font-sans text-xs font-medium text-ink/50 hover:text-ink">
              Cancel
            </button>
          )}
        </div>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">
          {isEditing ? `Update ${user.name}'s goal` : `Let's set ${user.name}'s goal`}
        </h1>
        <p className="mt-1 font-sans text-sm text-ink/60">
          We'll use this to calculate a daily calorie target for weight loss.
        </p>
      </header>

      <div className="flex-1 space-y-5 pb-32">
        <div>
          <FieldLabel>Sex</FieldLabel>
          <div className="flex gap-2">
            {(["female", "male"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSex(option)}
                className={`flex-1 rounded-full border py-2.5 font-sans text-sm font-medium capitalize transition ${
                  sex === option ? "border-ember bg-ember/10 text-ember" : "border-ink/15 text-ink/60"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Age (years)</FieldLabel>
          <input
            type="number"
            min={1}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper-raised px-3 py-2.5 font-mono text-sm focus:border-ember focus:outline-none"
          />
        </div>

        <div>
          <FieldLabel>Height</FieldLabel>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              placeholder="ft"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-paper-raised px-3 py-2.5 font-mono text-sm focus:border-ember focus:outline-none"
            />
            <input
              type="number"
              min={0}
              max={11}
              placeholder="in"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-paper-raised px-3 py-2.5 font-mono text-sm focus:border-ember focus:outline-none"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Weight (lb)</FieldLabel>
          <input
            type="number"
            min={1}
            value={weightLb}
            onChange={(e) => setWeightLb(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper-raised px-3 py-2.5 font-mono text-sm focus:border-ember focus:outline-none"
          />
        </div>

        <div>
          <FieldLabel>Activity level</FieldLabel>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="w-full rounded-xl border border-ink/15 bg-paper-raised px-3 py-2.5 font-sans text-sm focus:border-ember focus:outline-none"
          >
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Target weight-loss rate</FieldLabel>
          <div className="grid grid-cols-4 gap-2">
            {LOSS_RATE_OPTIONS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setWeeklyLossRate(rate)}
                className={`rounded-xl border py-2.5 font-mono text-sm font-medium transition ${
                  weeklyLossRate === rate ? "border-ember bg-ember/10 text-ember" : "border-ink/15 text-ink/60"
                }`}
              >
                {rate}/wk
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Goal weight (lb, optional)</FieldLabel>
          <input
            type="number"
            min={1}
            placeholder="No target set"
            value={goalWeightLb}
            onChange={(e) => setGoalWeightLb(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper-raised px-3 py-2.5 font-mono text-sm focus:border-ember focus:outline-none"
          />
        </div>

        {error && <p className="rounded-xl bg-rust/10 p-3 font-sans text-sm text-rust">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-paper/95 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-ember py-3.5 font-sans text-sm font-semibold text-cream transition hover:bg-ember/90 disabled:opacity-50"
        >
          {isSaving ? "Calculating…" : isEditing ? "Update my goal" : "Calculate my goal"}
        </button>
      </div>
    </form>
  );
}
