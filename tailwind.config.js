/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eefcfb',
          100: '#d4f6f3',
          200: '#aeebe7',
          300: '#79dad7',
          400: '#43c0c0',
          500: '#27a3a6',
          600: '#1c8386',
          700: '#1b696c',
          800: '#1b5457',
          900: '#12353a',
          950: '#0a2226',
        },
        // Flat design tokens — CSS variables defined in src/index.css, with a
        // `.dark` override, so every class below is theme-aware automatically.
        accent: 'var(--c-accent)',
        ink: 'var(--c-ink)',
        inkmuted: 'var(--c-ink-muted)',
        canvas: 'var(--c-canvas)',
        surface: 'var(--c-surface)',
        mist: 'var(--c-mist)',
        line: 'var(--c-line)',
        rowline: 'var(--c-rowline)',
        success: { DEFAULT: 'var(--c-success)', bg: 'var(--c-success-bg)', border: 'var(--c-success-border)' },
        warning: { DEFAULT: 'var(--c-warning)', bg: 'var(--c-warning-bg)', border: 'var(--c-warning-border)' },
        danger: { DEFAULT: 'var(--c-danger)', bg: 'var(--c-danger-bg)', border: 'var(--c-danger-border)' },
        info: { DEFAULT: 'var(--c-info)', bg: 'var(--c-info-bg)', border: 'var(--c-info-border)' },
        neutral: { DEFAULT: 'var(--c-neutral)', bg: 'var(--c-neutral-bg)', border: 'var(--c-neutral-border)' },
      },
      boxShadow: {
        flat: '0 1px 2px rgba(16,24,40,.04)',
      },
    },
  },
  plugins: [],
};
