/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета из брендбука (замени HEX, если в PDF указаны другие специфические оттенки)
        'get-red': '#DA291C',   // Фирменный красный
        'get-dark': '#27251F',  // Глубокий темный для текста и заголовков
        'get-gray': '#F2F2F2',  // Светло-серый для фонов таблиц
        
        // Переменные для логин-экрана (из Login.tsx)
        'bg': '#F9FAFB',
        'border': '#E5E7EB',
        'code-bg': '#F3F4F6',
      }
    },
  },
  plugins: [],
}