/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211E1A",
        paper: "#EFE6D2",
        "paper-raised": "#FFFDF7",
        ember: "#E1592C",
        sage: "#59754F",
        rust: "#A63A2E",
        steel: "#3F6C74",
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
