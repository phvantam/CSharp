/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'tv-base':      '#0a0a0a',
        'tv-surface':   '#121212',
        'tv-elevated':  '#1a1a1a',
        'tv-highlight': '#242424',
        'tv-press':     '#2a2a2a',
        'tv-accent':    '#1db954',
        'tv-accent-h':  '#1ed760',
        'tv-danger':    '#e91429',
        'tv-warning':   '#f59b23',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
