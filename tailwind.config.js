/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          100: "#F3E8FF",
          600: "#9333EA",
          700: "#fe408e",
        },
      },
    },
  },
  plugins: [],
};
