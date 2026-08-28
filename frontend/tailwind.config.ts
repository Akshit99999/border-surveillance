import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: "#070b12",
          panel: "#0b121e",
          card: "#0f1728",
          cardHover: "#152238",
          border: "#1e293b",
          borderBright: "#334155",
          accent: "#06b6d4",
          accentGlow: "rgba(6, 182, 212, 0.25)",
          primary: "#0284c7",
          cyan: "#38bdf8",
          red: "#ef4444",
          redGlow: "rgba(239, 68, 68, 0.3)",
          amber: "#f59e0b",
          amberGlow: "rgba(245, 158, 11, 0.25)",
          green: "#10b981",
          greenGlow: "rgba(16, 185, 129, 0.25)",
          blue: "#3b82f6",
          purple: "#a855f7",
          muted: "#64748b",
          text: "#f1f5f9",
          textMuted: "#94a3b8",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radarSweep 4s linear infinite",
        "scanline": "scanline 8s linear infinite",
        "blink": "blink 1s steps(2, start) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
