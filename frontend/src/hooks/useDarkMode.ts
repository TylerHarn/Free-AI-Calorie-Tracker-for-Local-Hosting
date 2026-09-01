import { useEffect, useState } from "react";

const STORAGE_KEY = "calorie-tracker-theme";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark((prev) => !prev) };
}
