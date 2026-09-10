import type { Favorite } from "../api";

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function QuickAddFavorites({
  favorites,
  onAdd,
  onDelete,
  onClose,
}: {
  favorites: Favorite[];
  onAdd: (favorite: Favorite) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-raised p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Favorites</p>
        <button type="button" onClick={onClose} className="text-xs font-medium text-ink/50 hover:text-ink">
          Close
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="py-2 text-center text-sm text-ink/40">
          No favorites yet — star a logged meal to save it here.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {favorites.map((favorite) => (
            <li key={favorite.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAdd(favorite)}
                className="flex flex-1 items-center justify-between rounded-lg border border-ink/10 bg-paper px-3 py-2 text-left transition hover:border-accent"
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-sm text-ink">{favorite.food_name}</span>
                  {favorite.serving_size && (
                    <span className="ml-1.5 text-xs text-ink/40">{favorite.serving_size}</span>
                  )}
                </span>
                <span className="ml-2 shrink-0 text-sm font-semibold tabular-nums text-ink/70">
                  {favorite.estimated_calories}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(favorite.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/30 hover:bg-danger/10 hover:text-danger"
                title="Remove favorite"
                aria-label="Remove favorite"
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
