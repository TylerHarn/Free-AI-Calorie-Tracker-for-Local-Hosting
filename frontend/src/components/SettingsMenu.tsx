import { useEffect, useRef, useState } from "react";
import { useDarkMode } from "../hooks/useDarkMode";

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-ember" : "bg-ink/15"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsMenu({
  onEditGoal,
  onSignOut,
}: {
  onEditGoal: () => void;
  onSignOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleDark } = useDarkMode();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Settings"
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition hover:border-ink/30 hover:text-ink"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M19.4 13.6a1.7 1.7 0 0 0 .34 1.87l.06.06a2.05 2.05 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V20a2.05 2.05 0 1 1-4.1 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2.05 2.05 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .34-1.87A1.7 1.7 0 0 0 3.4 12.5H3.3a2.05 2.05 0 1 1 0-4.1h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.05 2.05 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.87.34H9.5A1.7 1.7 0 0 0 11 3.9V3.8a2.05 2.05 0 1 1 4.1 0v.1a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.05 2.05 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1.03h.1a2.05 2.05 0 1 1 0 4.1h-.1a1.7 1.7 0 0 0-1.55 1.03Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-60 overflow-hidden rounded-2xl border border-ink/10 bg-paper-raised shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEditGoal();
            }}
            className="block w-full px-4 py-3 text-left font-sans text-sm text-ink hover:bg-ink/5"
          >
            Edit fitness goals
          </button>

          <div className="flex items-center justify-between border-t border-dotted border-ink/15 px-4 py-3">
            <span className="font-sans text-sm text-ink">Dark mode</span>
            <ToggleSwitch checked={isDark} onChange={toggleDark} label="Toggle dark mode" />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="block w-full border-t border-dotted border-ink/15 px-4 py-3 text-left font-sans text-sm text-rust hover:bg-rust/5"
          >
            Switch user
          </button>
        </div>
      )}
    </div>
  );
}
