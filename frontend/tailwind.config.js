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
        ember: themeColor("ember"),
        sage: themeColor("sage"),
        rust: themeColor("rust"),
        steel: themeColor("steel"),
        // Fixed light color for text/icons on vivid accent fills (ember/steel buttons) —
        // does NOT swap with theme, since those fills stay vivid in both light and dark.
        cream: "rgb(255 253 247 / <alpha-value>)",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Work Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
