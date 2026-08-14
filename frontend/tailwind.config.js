/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Single brand ramp — every primary surface, button and accent
        // in the app resolves to one of these.
        brand: {
          50: '#eef4ff',
          100: '#d9e5ff',
          200: '#bcd1ff',
          300: '#8eb3ff',
          400: '#598aff',
          500: '#3563f0',
          600: '#2445d6',
          700: '#1d36ac',
          800: '#1c3088',
          900: '#1c2c6c',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#dde1e9',
          300: '#c1c8d6',
          400: '#8d97ac',
          500: '#5f6a82',
          600: '#454e64',
          700: '#333b4d',
          800: '#1f2534',
          900: '#121722',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Deliberate scale — components pick from these, not arbitrary sizes
        'display': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'title': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading': ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '700' }],
        'label': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 23, 34, 0.04), 0 4px 16px rgba(18, 23, 34, 0.06)',
        'card-hover': '0 8px 32px rgba(36, 69, 214, 0.14)',
        overlay: '0 24px 64px rgba(18, 23, 34, 0.28)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
        'fade-up': 'fade-up 0.3s ease-out both',
        'scale-in': 'scale-in 0.15s ease-out both',
        'slide-up': 'slide-up 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
