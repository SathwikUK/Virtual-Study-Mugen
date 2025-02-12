/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // Ensure all React component files are included
  ],
  theme: {
    extend: {
      fontFamily: {
        futuristic: ["Orbitron", "sans-serif"],  // Sci-fi styled font
      },
      colors: {
        neonBlue: "#3a86ff",
        neonPink: "#ff006e",
        neonPurple: "#8338ec",
        darkBg: "#0d1117",  // Dark futuristic background
      },
      boxShadow: {
        neon: "0 0 10px rgba(131, 56, 236, 0.7)",  // Glowing shadow effect
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-in-out",
        pulseGlow: "pulseGlow 2s infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        pulseGlow: {
          "0%": { boxShadow: "0 0 5px #8338ec" },
          "100%": { boxShadow: "0 0 20px #ff006e" },
        },
      },
    },
  },
  plugins: [],
};
