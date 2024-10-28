/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
        textColor: {
            'inactive' : 'gray-300'
        }
    },
  },
  plugins: [],
}

