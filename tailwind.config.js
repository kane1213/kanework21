/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        'order': '#FE9432',
        'waiting': '#7EBAD3',
        'transcation': '#F3AF00',
        'greenlight': '#8CD7BC'
      }
    },
    
  },
  plugins: [],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}

