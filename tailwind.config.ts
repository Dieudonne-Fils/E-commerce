import type { Config } from 'tailwindcss'
import { brandBlue as blue, pageBackground } from './src/lib/brand'

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
        background: pageBackground,
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