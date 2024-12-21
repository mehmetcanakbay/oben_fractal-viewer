/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors:{
        'oben-main': "#222222",
        'oben-secondary': "#402915",
        'oben-tertiary': "#F2E1AC",
        'oben-special': "#8A91A6",
        'oben-special2': "#F2F2F2",
      }
    },
  },
  plugins: [],
}

