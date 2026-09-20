import type { Config } from "tailwindcss";

const config: Config = {
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
        ink: {
          50: '#f6f5f1',
          100: '#ece9e1',
          200: '#d8d3c5',
          300: '#bdb6a2',
          400: '#9c937b',
          500: '#7a7058',
          600: '#5c5340',
          700: '#3e3829',
          800: '#26221a',
          900: '#15130e',
          950: '#0b0a07',
        },
        paper: {
          50: '#fdfcf8',
          100: '#faf8f1',
          200: '#f4f0e3',
          300: '#ebe5d0',
          400: '#ddd4b6',
        },
        clay: {
          50: '#fbf3ee',
          100: '#f5e1d4',
          200: '#e9c4a8',
          300: '#d99d75',
          400: '#c97744',
          500: '#b85d2a',
          600: '#9c4820',
          700: '#7d3a1c',
          800: '#5e2d17',
          900: '#42200f',
        },
        moss: {
          400: '#7a9b6e',
          500: '#5a7d50',
          600: '#44603b',
        },
        rust: {
          400: '#c25b3e',
          500: '#a8442a',
          600: '#8a3621',
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightish: '-0.015em',
        tighter2: '-0.03em',
      },
      maxWidth: {
        '8xl': '88rem',
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
export default config;
