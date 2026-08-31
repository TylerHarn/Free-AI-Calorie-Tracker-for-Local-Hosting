import { useEffect, useState } from "react";
import { createUser, getUsers, selectUser, type HouseholdMember, type User } from "../api";

export default function LoginPage({ onSignedIn }: { onSignedIn: (user: User) => void }) {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    getUsers()
      .then(setMembers)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load household members."));
  }, []);

  async function handleSelect(member: HouseholdMember) {
    setIsBusy(true);
    setError(null);
    try {
      const user = await selectUser(member.id);
      onSignedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setIsBusy(true);
    setError(null);
    try {
      const user = await createUser(name);
      onSignedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40">Calorie Tracker</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-ink">Who's eating?</h1>
      </header>

      <div className="flex-1 space-y-2">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            disabled={isBusy}
            onClick={() => handleSelect(member)}
            className="flex w-full items-center justify-between rounded-2xl border border-ink/15 bg-paper-raised px-5 py-4 text-left transition hover:border-ember disabled:opacity-50"
          >
            <span className="font-display text-lg text-ink">{member.name}</span>
            {!member.setup_complete && (
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink/35">setup needed</span>
            )}
          </button>
        ))}

        <form onSubmit={handleCreate} className="flex items-center gap-2 rounded-2xl border border-dashed border-ink/25 px-5 py-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="+ New place setting"
            className="flex-1 bg-transparent font-display text-lg text-ink placeholder:text-ink/35 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isBusy || !newName.trim()}
            className="shrink-0 rounded-full bg-ember px-4 py-2 font-sans text-sm font-semibold text-paper-raised transition hover:bg-ember/90 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {error && <p className="rounded-xl bg-rust/10 p-3 font-sans text-sm text-rust">{error}</p>}
      </div>
    </div>
  );
}
