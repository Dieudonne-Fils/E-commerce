import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        border: '#e7e2da',
        input: '#ddd6cc',
        ring: '#1c1917',
        background: '#faf8f5',
        foreground: '#1c1917',
        // Ink: the brand's neutral, used for primary actions, prices and links
        primary: {
          DEFAULT: '#1c1917',
          foreground: '#faf8f5',
          50: '#f6f3ee',
          100: '#ede7de',
          500: '#57534e',
          600: '#292524',
          700: '#1c1917',
        },
        // Brand blue: the single accent, reserved for highlights (badges, ratings, eyebrows, charts).
        // 600 is the store's original button blue and keeps 5.2:1 contrast on white, so it is safe for small text
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#f1ece4',
          foreground: '#1c1917',
        },
        destructive: {
          DEFAULT: '#b42318',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1ece4',
          foreground: '#78716c',
        },
        accent: {
          DEFAULT: '#f1ece4',
          foreground: '#1c1917',
        },
      },
    },
  },
  plugins: [],
}
export default config