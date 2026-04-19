/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wa: {
          green: '#25D366',
          'green-dark': '#128C7E',
          'green-light': '#DCF8C6',
          teal: '#075E54',
          'bg-light': '#F0F2F5',
          'panel': '#FFFFFF',
          'chat-bg': '#EAE6DF',
          'bubble-out': '#D9FDD3',
          'bubble-in': '#FFFFFF',
          'icon': '#54656F',
          'text-primary': '#111B21',
          'text-secondary': '#667781',
          'divider': '#E9EDEF',
          'hover': '#F5F6F6',
          'active': '#EBEEF0',
        }
      },
      backgroundImage: {
        'chat-pattern': "url(\"data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C4C4C4' fill-opacity='0.07'%3E%3Ccircle cx='50' cy='50' r='3'/%3E%3Ccircle cx='150' cy='50' r='3'/%3E%3Ccircle cx='250' cy='50' r='3'/%3E%3Ccircle cx='350' cy='50' r='3'/%3E%3Ccircle cx='50' cy='150' r='3'/%3E%3Ccircle cx='150' cy='150' r='3'/%3E%3Ccircle cx='250' cy='150' r='3'/%3E%3Ccircle cx='350' cy='150' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      fontSize: {
        '2xs': '0.7rem',
      }
    },
  },
  plugins: [],
}