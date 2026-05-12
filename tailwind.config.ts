import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        void: {
          950: "#0b1220",
          900: "#0f172a",
          800: "#1e293b",
        },
        verso: {
          green: "#1D9E75",
          amber: "#F59E0B",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-dm-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        hero: "-0.02em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
      },
      minHeight: {
        tap: "48px",
      },
    },
  },
  plugins: [],
};
export default config;
