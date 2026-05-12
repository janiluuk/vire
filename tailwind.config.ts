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
        verso: {
          green: "#1D9E75",
          amber: "#F59E0B",
        },
      },
      minHeight: {
        tap: "48px",
      },
    },
  },
  plugins: [],
};
export default config;
