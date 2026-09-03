import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFAF8", // warm off-white
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#171512", // near-black warm
          soft: "#4A4640",
          faint: "#8A8378",
        },
        line: "#EAE6DF", // warm gray border
        accent: {
          DEFAULT: "#F0521B", // vivid orange/coral
          soft: "#FF7A45",
          wash: "#FDEEE7",
          ring: "#F0521B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,21,18,0.04), 0 8px 24px -12px rgba(23,21,18,0.10)",
        lift: "0 2px 4px rgba(23,21,18,0.05), 0 18px 40px -18px rgba(23,21,18,0.18)",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%,100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-18px)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        drift: "drift 9s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
