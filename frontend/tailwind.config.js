/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas:  '#FCFCFB',
        surface: '#FFFFFF',
        quiet:   '#F5F5F4',
        line:    '#EAEAE8',
        lineStrong: '#D6D6D3',
        ink:     '#0A0A0B',
        pen:     '#2E2E30',
        muted:   '#6B6E76',
        soft:    '#A5A8B0',
        brand: {
          DEFAULT: '#34B233',
          hover:   '#2A9A2A',
          deep:    '#1F7A20',
          soft:    '#ECFBEC',
          fill:    '#F5FDF5',
        },
        warn: '#B45309',
        warnSoft: '#FEF3C7',
        danger: '#9A1F1F',
        dangerSoft: '#FEE7E7',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter2: '-0.03em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,10,11,0.04), 0 0 0 1px rgba(10,10,11,0.06)',
        cardHover: '0 4px 12px rgba(10,10,11,0.06), 0 0 0 1px rgba(10,10,11,0.08)',
        pop: '0 20px 48px -12px rgba(10,10,11,0.18), 0 0 0 1px rgba(10,10,11,0.06)',
        inner: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
    },
  },
  plugins: [],
};
