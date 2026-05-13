import type { Config } from "tailwindcss";

const config = {
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
        canvas: "var(--bg)",
        raised: "var(--bg2)",
        card: "var(--bg3)",
        sunken: "var(--bg4)",
        ink: "var(--text)",
        fog: "var(--muted)",
        dust: "var(--dim)",
        edge: "var(--border)",
        g: "var(--g)",
        g2: "var(--g2)",
        g3: "var(--g3)",
        amber: "var(--amber)",
        danger: "var(--danger)",
        statusPending: "var(--status-pending)",
        statusProgress: "var(--status-progress)",
        statusDone: "var(--status-done)",
        statusCancel: "var(--status-cancel)",
        vire: {
          green: "var(--g)",
          amber: "var(--amber)",
        },
      },
      borderColor: {
        DEFAULT: "var(--border)",
        em: "var(--border2)",
        brand: "var(--g)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          "var(--font-dm-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        hero: "-0.02em",
        display: "-0.02em",
        section: "-0.01em",
        label: "0.08em",
        eyebrow: "0.15em",
      },
      minHeight: {
        tap: "48px",
      },
      maxWidth: {
        content: "1100px",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
