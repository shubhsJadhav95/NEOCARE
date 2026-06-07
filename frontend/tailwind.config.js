/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-slate': '#334155',
        'neo-blue': '#0ea5e9',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        '3d': '0 20px 50px rgba(51, 65, 85, 0.15), 0 10px 15px rgba(14, 165, 233, 0.05)',
        'glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
      }
    },
  },
  plugins: [],
}