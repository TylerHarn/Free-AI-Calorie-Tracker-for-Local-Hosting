import { useEffect, useState } from "react";
import { getActivities, type Activity } from "../api";

export default function LogWorkoutForm({
  onEstimate,
  isEstimating,
}: {
  onEstimate: (activity: string, durationMinutes: number) => void;
  isEstimating: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (isOpen && activities.length === 0) {
      getActivities()
        .then((list) => {
          setActivities(list);
          setActivity((prev) => prev || list[0]?.value || "");
        })
        .catch(() => {
          // activity picker is a nice-to-have to prefill; leave the select empty on failure
        });
    }
  }, [isOpen, activities.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedDuration = Number(duration);
    if (!activity || !Number.isFinite(parsedDuration) || parsedDuration <= 0) return;
    onEstimate(activity, parsedDuration);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-2 text-center font-sans text-sm font-medium text-steel underline decoration-dotted underline-offset-4 hover:text-steel/80"
      >
        + Log a workout
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl border border-steel/20 bg-paper-raised p-4">
      <select
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-sans text-sm focus:border-steel focus:outline-none"
      >
        {activities.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 font-mono text-sm focus:border-steel focus:outline-none"
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
          disabled={isEstimating || !activity || duration.trim() === ""}
          className="flex-1 rounded-full bg-steel py-2 font-sans text-sm font-semibold text-cream transition hover:bg-steel/90 disabled:opacity-50"
        >
          {isEstimating ? "Estimating…" : "Estimate"}
        </button>
      </div>
    </form>
  );
}
