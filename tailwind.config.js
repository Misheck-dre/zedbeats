/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zed: {
          orange: '#F97316',
          red: '#EF4444',
          dark: '#0a0a14',
          surface: '#0f0f1e',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      backgroundOpacity: {
        3: '0.03',
        8: '0.08',
      },
    },
  },
  plugins: [],
}
