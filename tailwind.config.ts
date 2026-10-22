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
        // Clay: the single accent, reserved for highlights (badges, ratings, sale cues)
        clay: {
          50: '#fbf3ee',
          100: '#f6e3d8',
          500: '#c8643b',
          600: '#b4532a',
          700: '#923f1d',
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