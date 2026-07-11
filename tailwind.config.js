/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 80px rgba(56, 189, 248, 0.15)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 35%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.12), transparent 22%)',
      },
    },
  },
  plugins: [],
};
