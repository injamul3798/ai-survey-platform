import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f7f8",
        panel: "#ffffff",
        ink: "#121417",
        muted: "#6b7280",
        line: "#e5e7eb",
        accent: "#1463ff",
        success: "#0f9f6e",
        warning: "#b45309",
        danger: "#c2410c",
      },
      boxShadow: {
        panel: "0 10px 30px rgba(18, 20, 23, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;

