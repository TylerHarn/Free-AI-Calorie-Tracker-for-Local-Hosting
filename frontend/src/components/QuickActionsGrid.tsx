export type QuickAction = "manual" | "barcode" | "favorites" | "workout";

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarcodeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M3 5v14M7 5v14M10 5v14M13 5v14M15.5 5v14M19 5v14M21 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACTIONS: { value: QuickAction; label: string; icon: JSX.Element; accent: string }[] = [
  { value: "manual", label: "By Hand", icon: <EditIcon />, accent: "text-ember" },
  { value: "barcode", label: "Barcode", icon: <BarcodeIcon />, accent: "text-ember" },
  { value: "favorites", label: "Favorites", icon: <StarIcon />, accent: "text-ember" },
  { value: "workout", label: "Workout", icon: <ActivityIcon />, accent: "text-steel" },
];

export default function QuickActionsGrid({ onSelect }: { onSelect: (action: QuickAction) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.value}
          type="button"
          onClick={() => onSelect(action.value)}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-ink/10 bg-paper-raised py-4 transition hover:border-ink/25"
        >
          <span className={action.accent}>{action.icon}</span>
          <span className="font-sans text-xs font-medium text-ink/70">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
