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
          "var(--font-inter)",
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
      spacing: {
        "spark-1": "var(--space-1)",
        "spark-2": "var(--space-2)",
        "spark-3": "var(--space-3)",
        "spark-4": "var(--space-4)",
        "spark-6": "var(--space-6)",
        "spark-8": "var(--space-8)",
        "spark-12": "var(--space-12)",
        "spark-card": "var(--space-card-padding)",
      },
      borderRadius: {
        "spark-sm": "var(--radius-sm)",
        "spark-md": "var(--radius-md)",
        "spark-lg": "var(--radius-lg)",
        "spark-xl": "var(--radius-xl)",
        "spark-2xl": "var(--radius-2xl)",
        "spark-full": "var(--radius-full)",
      },
      boxShadow: {
        "elevation-xs": "var(--shadow-xs)",
        "elevation-sm": "var(--shadow-sm)",
        "elevation-md": "var(--shadow-md)",
        "glow-accent": "var(--shadow-glow-accent)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        hover: "var(--duration-hover)",
        base: "var(--duration-base)",
        panel: "var(--duration-panel)",
        route: "var(--duration-route)",
      },
      transitionTimingFunction: {
        "out-soft": "var(--ease-out-soft)",
        standard: "var(--ease-standard)",
      },
      fontSize: {
        "spark-xs": ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        "spark-sm": ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        "spark-body": ["var(--text-body)", { lineHeight: "var(--leading-relaxed)" }],
      },
      backdropBlur: {
        "spark-sm": "var(--blur-sm)",
        "spark-md": "var(--blur-md)",
        "spark-lg": "var(--blur-lg)",
        "spark-xl": "var(--blur-xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
