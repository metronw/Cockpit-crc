import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#235AB4",
        secondary: "#9FA6B2",
        danger: "#DC4C64",
        success: "#14A44D",
        warning: "#E4A11B",
        info: "#54B4D3",
        light: "#FBFBFB",
        dark: "#332D2D",
      },
      spacing: {
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;
