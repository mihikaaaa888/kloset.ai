/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Palette (Phase C rebrand) ─────────────────────────────────────
        // 'dark-purple'/'deep-purple' now hold a light cream (previously a
        // dark purple — token names kept so every existing class still
        // applies, but they're a light base color now, not a dark one) and
        // 'butter-yellow'/'soft-butter' hold a dark forest green (previously
        // a light butter yellow). Any spot that paired the old dark-purple
        // with white text, or used dark-purple as standalone foreground
        // text, needed a manual follow-up fix — see git history for that pass.
        'dark-purple': '#FFFDD0',
        'deep-purple': '#F5F0B8',
        'butter-yellow': '#355E3B',
        'soft-butter': '#4A7856',
        'warm-cream': '#FCFAF4',
        'text-primary': '#241B29',
        'text-muted': '#766C78',
        purple: {
          950: '#2B173F',
          900: '#3A2154',
          800: '#4D2D6B',
          700: '#613A84',
          400: '#A47BC0',
          300: '#C4A8D8',
        },
        // ── Legacy palette (kept for existing components during migration) ─
        cream: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#EDE9E2',
          300: '#DDD8CE',
        },
        charcoal: {
          900: '#111110',
          800: '#1A1A19',
          700: '#2C2C2A',
          600: '#3D3D3A',
          500: '#5C5C58',
          400: '#7A7A75',
        },
        stone: {
          warm: '#8C7B6E',
          light: '#B8A99A',
          muted: '#D4C9BE',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#E8D5B0',
          muted: '#F0E6D3',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        // Headings — an editorial high-contrast serif with a true italic.
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Just for the "Kloset" wordmark. The personal-use build of Mutalis swaps
        // every digit for a "PERSONAL USE ONLY" watermark, so never use it on
        // text that can contain numbers.
        brand: ['"Mutalis Fashion"', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        widest: '0.25em',
        'ultra-wide': '0.35em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(0,0,0,0.06)',
        'medium': '0 4px 40px rgba(0,0,0,0.10)',
        'lifted': '0 8px 60px rgba(0,0,0,0.14)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      transitionTimingFunction: {
        'ease-editorial': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
