/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === ОСНОВНЫЕ ЦВЕТА ИЗ БРЕНДБУКА ГЭТ (раздел 2.6) ===
        'get-red': '#E4032E',      // Красный ализариновый (C0 M100 Y80 K0 | R228 G3 B46)
        'get-dark-blue': '#24305E', // Темно-синий (C100 M90 Y35 K20 | R36 G48 B94)
        'get-cyan': '#009CBC',      // Темно-голубой (C100 M0 Y25 K0 | R0 G156 B188)
        
        // === ДОПОЛНИТЕЛЬНЫЕ ЦВЕТА ===
        'get-orange': '#FFBA00',    // Желто-оранжевый (C0 M30 Y100 K0 | R251 G186 B0)
        'get-green': '#AFCB37',     // Светло-зеленый (C40 M0 Y90 K0 | R175 G203 B55)
        'get-aqua': '#8ACBC1',      // Бледный аквамариновый (C50 M0 Y30 K0 | R138 G203 B193)
        'get-gray': '#DADADA',      // Серый (C0 M0 Y0 K20 | R218 G218 B218)
        'get-light-gray': '#F2F2F2',// Светло-серый для фонов таблиц
        
        // === СИСТЕМНЫЕ ЦВЕТА (для UI) ===
        'bg-main': '#F9FAFB',       // Основной фон страницы
        'border-subtle': '#E5E7EB', // Тонкие границы
        'code-bg': '#F3F4F6',       // Фон для блоков кода
        'text-primary': '#24305E',  // Основной текст (get-dark-blue)
        'text-secondary': '#6B7280',// Вторичный текст
      },
      borderRadius: {
        'get': '8px', // Фирменное скругление углов
        'get-lg': '12px',
      },
      boxShadow: {
        'get': '0 2px 8px rgba(36, 48, 94, 0.12)', // Тень в стиле ГЭТ
        'get-hover': '0 4px 16px rgba(36, 48, 94, 0.16)',
      },
      transitionTimingFunction: {
        'get': 'cubic-bezier(0.4, 0, 0.2, 1)', // Плавная анимация
      },
    },
  },
  plugins: [],
}