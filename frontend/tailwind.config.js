/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas:  '#F5F2EA',
        paper:   '#FFFFFF',
        ink:     '#14140F',
        pen:     '#4A4A44',
        muted:   '#8B8A82',
        soft:    '#B9B6AB',
        rule:    '#E3DFD5',
        ruleStrong: '#C9C4B5',
        brand: {
          DEFAULT: '#34B233',
          hover:   '#2A9A2A',
          deep:    '#1F7A20',
          soft:    '#E9F7EA',
          fill:    '#F3FAF3',
        },
        warn: '#B45309',
        warnSoft: '#FEF3C7',
        danger: '#9A1F1F',
        dangerSoft: '#F8E5E5',
      },
      letterSpacing: {
        tightest: '-0.04em',
        editorial: '-0.025em',
      },
      fontSize: {
        eyebrow: ['10.5px', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
    },
  },
  plugins: [],
};
