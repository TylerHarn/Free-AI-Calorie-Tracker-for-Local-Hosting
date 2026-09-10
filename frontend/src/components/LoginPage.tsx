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
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Calorie tracker</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Choose a profile</h1>
      </header>

      <div className="flex-1 space-y-2">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            disabled={isBusy}
            onClick={() => handleSelect(member)}
            className="flex w-full items-center justify-between rounded-2xl border border-ink/15 bg-paper-raised px-5 py-4 text-left transition hover:border-accent disabled:opacity-50"
          >
            <span className="text-lg font-medium text-ink">{member.name}</span>
            {!member.setup_complete && (
              <span className="text-xs font-medium text-ink/40">Setup needed</span>
            )}
          </button>
        ))}

        <form onSubmit={handleCreate} className="flex items-center gap-2 rounded-2xl border border-ink/15 px-5 py-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add a profile"
            className="flex-1 bg-transparent text-lg text-ink placeholder:text-ink/35 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isBusy || !newName.trim()}
            className="shrink-0 rounded-full bg-accent-fill px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
