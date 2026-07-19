import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#fafafa",
        surface: "#ffffff",
        border: "#ececec",
        muted: "#6b7280",
        ink: "#111827",
        accent: "#5b5bd6",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,24,39,0.04), 0 1px 1px rgba(17,24,39,0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
