import { useState } from "react";
import type { Favorite } from "../api";

export default function QuickAddFavorites({
  favorites,
  onAdd,
  onDelete,
}: {
  favorites: Favorite[];
  onAdd: (favorite: Favorite) => void;
  onDelete: (id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-2 text-center font-sans text-sm font-medium text-ink/50 underline decoration-dotted underline-offset-4 hover:text-ember"
      >
        + Quick add from favorites
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-raised p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40">Favorites</p>
        <button type="button" onClick={() => setIsOpen(false)} className="font-sans text-xs font-medium text-ink/50 hover:text-ink">
          Close
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="py-2 text-center font-sans text-sm text-ink/40">
          No favorites yet — star a logged meal to save it here.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {favorites.map((favorite) => (
            <li key={favorite.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAdd(favorite)}
                className="flex flex-1 items-center justify-between rounded-lg border border-ink/10 bg-paper px-3 py-2 text-left transition hover:border-ember"
              >
                <span className="truncate font-sans text-sm text-ink">{favorite.food_name}</span>
                <span className="ml-2 shrink-0 font-mono text-sm font-semibold text-ink/70">
                  {favorite.estimated_calories}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(favorite.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink/30 hover:bg-rust/10 hover:text-rust"
                title="Remove favorite"
                aria-label="Remove favorite"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
