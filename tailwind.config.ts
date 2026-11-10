import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171a",
        body: "#3a3f46",
        muted: "#676d76",
        line: "#e3e1dc",
        paper: "#f6f5f1",
        accent: "#1d5a43",
        accentSoft: "#e8f1ec",
      },
      fontFamily: {
        sans: ["Inter Variable", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
