import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
        architectural: {
          dark: "#0c0c0b",
          charcoal: "#161614",
          surface: "#1f1e1b",
          surfaceHover: "#282723",
          border: "rgba(255, 255, 255, 0.09)",
          borderLight: "rgba(0, 0, 0, 0.08)",
          cream: "#f6f5f1",
          creamMuted: "#e6e4dc",
          textMuted: "#8e8c85",
          terracotta: "#c86446",
          terracottaLight: "#df785c",
          ochre: "#c99a4c",
          cyanAccent: "#00d084",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      letterSpacing: {
        ultra: "0.25em",
        mega: "0.35em",
      },
    },
  },
  plugins: [],
};
export default config;
