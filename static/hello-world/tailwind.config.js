/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        paper: '#f8fafc',
        accent: '#0f766e',
        accentDark: '#115e59',
        panel: '#ffffff',
        line: '#cbd5e1'
      },
      boxShadow: {
        panel: '0 18px 45px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};