/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',    // Warna Header Figma
          dark: '#1E40AF',
          bg: '#F3F4F6'
        }
      }
    },
  },
  plugins: [],
}