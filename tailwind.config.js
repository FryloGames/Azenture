/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'welding-orange': '#FF6B35',
          'welding-dark': '#0A0A0A',
          'welding-surface': '#1A1A1A',
        }
      },
    },
    plugins: [],
  }