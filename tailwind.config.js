/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        milk: {
          50: '#FAFAF8',
          100: '#F5F3EE',
          200: '#EDE9E0',
        },
        teal: {
          600: '#0D9488',
          700: '#0F766E',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
