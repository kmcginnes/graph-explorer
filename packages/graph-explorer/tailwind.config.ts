/** @type {import('tailwindcss').Config} */
import { type Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
