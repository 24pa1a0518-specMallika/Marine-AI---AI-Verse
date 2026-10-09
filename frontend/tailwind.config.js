/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chart: {
          bg: '#0B1E2D',        // deep chart-ink navy (background)
          surface: '#132C40',   // panel/surface, one step up
          accent: '#C9A961',    // brass/parchment accent (dominant CTA & nav)
          'accent-hover': '#B89750',
          safe: '#3E7C6B',      // chart-sounding teal (safe/proceed only)
          danger: '#B8543C',    // rust/warning-buoy red (danger/DO_NOT_SAIL only)
          text: '#D8D2C2',      // soundings-paper off-white (primary text)
          muted: '#8EA5B5',     // muted soundings depth label
          border: '#1E3F5A',    // chart sounding coordinate border
        },
        marine: {
          navy: '#0B1E2D',
          'navy-dark': '#071622',
          'navy-sidebar': '#132C40',
          blue: '#C9A961',
          'blue-dark': '#A3843E',
          cyan: '#C9A961',
          'cyan-glow': '#E0C788',
          teal: '#3E7C6B',
          bg: '#0B1E2D',
          surface: '#132C40',
          border: '#1E3F5A',
          'text-primary': '#D8D2C2',
          'text-secondary': '#8EA5B5',
          'text-muted': '#6D8291',
        },
        status: {
          safe: '#3E7C6B',
          'safe-bg': 'rgba(62, 124, 107, 0.15)',
          'safe-border': 'rgba(62, 124, 107, 0.40)',
          warning: '#C9A961',
          'warning-bg': 'rgba(201, 169, 97, 0.15)',
          'warning-border': 'rgba(201, 169, 97, 0.40)',
          danger: '#B8543C',
          'danger-bg': 'rgba(184, 84, 60, 0.15)',
          'danger-border': 'rgba(184, 84, 60, 0.40)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'marine': '8px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(6, 40, 61, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
