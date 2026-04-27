import type { Config } from "tailwindcss";

const config: Config = {
  content: ["popup.html", "src/**/*.{ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#5B5BD6",
        success: "#1D9E75",
        danger: "#D85A30",
        surface: "#F8F8F7",
        border: "#E4E3DF",
      },
    },
  },
  plugins: [],
};

export default config;
