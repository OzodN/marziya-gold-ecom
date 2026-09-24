import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FCFAF6",
          100: "#F6F1E7",
          200: "#ECE0C8",
          300: "#DEC89F",
          400: "#CCA96C",
          500: "#B88E3E", // Master jewelry accent gold
          600: "#9C732F",
          700: "#7E5825",
          800: "#5D411C",
          900: "#3D2B13",
          950: "#221708",
        },
        noir: {
          50: "#F6F6F7",
          100: "#ECECEE",
          200: "#D4D4D8",
          300: "#A1A1AA",
          400: "#71717A",
          500: "#52525B",
          600: "#3F3F46",
          700: "#27272A",
          800: "#18181B",
          900: "#121214",
          950: "#09090B", // Luxury deep obsidian background
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(184, 142, 62, 0.25)",
        "gold-glow": "0 0 25px rgba(204, 169, 108, 0.35)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
