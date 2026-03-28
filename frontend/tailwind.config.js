/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0f0e0e',
          800: '#1a1918',
          700: '#2a2826',
          600: '#3d3a37',
          400: '#7a7570',
          200: '#c4bfba',
        },
        gold: {
          400: '#f0b429',
          300: '#f7cc5a',
          200: '#fde68a',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}