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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Calorie Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Who's logging a meal?</p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-md">
          {members.length > 0 && (
            <div className="mb-6 space-y-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleSelect(member)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {member.name}
                  {!member.setup_complete && (
                    <span className="text-xs font-normal text-slate-400">setup needed</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Add a household member
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isBusy || !newName.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>
      </div>
    </div>
  );
}
