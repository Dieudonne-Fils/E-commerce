import type { Config } from 'tailwindcss'

// The store's original blue. 600 keeps 5.2:1 contrast on white (white labels and small text stay readable);
// 950 is the deep navy used for large surfaces such as the footer
const blue = {
  50: '#eff6ff',
  100: '#dbeafe',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  950: '#172554',
}

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
        ring: blue[600],
        background: '#faf8f5',
        foreground: '#1c1917',
        // Actions (buttons, active filters, announcement bar) and highlights share the same blue
        primary: {
          DEFAULT: blue[600],
          foreground: '#ffffff',
          ...blue,
        },
        brand: blue,
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