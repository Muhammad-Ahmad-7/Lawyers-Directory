import type { Config } from "tailwindcss";

// Design tokens live in src/app/globals.css as RGB channels so Tailwind's
// opacity modifiers (bg-primary/90) work.
const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        background: channel("background"),
        foreground: channel("foreground"),
        card: channel("card"),
        primary: { DEFAULT: channel("primary"), foreground: channel("primary-foreground") },
        muted: { DEFAULT: channel("muted"), foreground: channel("muted-foreground") },
        destructive: channel("destructive"),
        ring: channel("ring"),
        border: channel("border"),
        input: channel("input"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
