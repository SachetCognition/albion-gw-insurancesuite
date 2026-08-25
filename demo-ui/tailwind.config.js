/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          900: '#04070f',
          800: '#070c1a',
          700: '#0b1224',
          600: '#111a30',
          500: '#1a2544',
        },
        gold: {
          400: '#e8bf6a',
          500: '#d4a441',
          600: '#a87c26',
        },
        legacy: '#7c8bab',
        candidate: '#3fd0c9',
        alert: '#ff6b6b',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232,191,106,0.25), 0 20px 60px -20px rgba(232,191,106,0.25)',
        panel: '0 24px 70px -30px rgba(0,0,0,0.9)',
      },
      keyframes: {
        pulseline: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        pulseline: 'pulseline 2.4s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
