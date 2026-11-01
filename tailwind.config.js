/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1a237e",
        "brand-border": "#b3c8f9",
        "brand-soft": "#f7faff",
        "brand-shadow": "#e3e9f7",
        page: "#f1f3f6", // fundo geral cinza-claro
        line: "#e2e6ec", // bordas sutis de cards e divisórias
      },
      fontFamily: {
        sans: ["Montserrat", "Arial", "sans-serif"],
        display: ["Montserrat", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};