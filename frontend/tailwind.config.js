/** @type {import('tailwindcss').Config} */
function themeColor(name) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: themeColor("ink"),
        paper: themeColor("paper"),
        "paper-raised": themeColor("paper-raised"),
        accent: themeColor("accent"),
        "accent-fill": themeColor("accent-fill"),
        success: themeColor("success"),
        warning: themeColor("warning"),
        danger: themeColor("danger"),
        workout: themeColor("workout"),
        "workout-fill": themeColor("workout-fill"),
      },
    },
  },
  plugins: [],
};
