/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage': '#7A8B82',
        'sage-dim': '#EAF0EC',
        'terracotta': '#B67A62',
        'terracotta-dim': '#F5EBE6',
        'off-white': '#FAFAF7',
      },
    },
  },
  plugins: [],
}
