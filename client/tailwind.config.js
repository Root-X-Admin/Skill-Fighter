module.exports = {
  darkMode: 'class', // 🌑 enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: '#00f0ff',
        neonGreen: '#39ff14',
        darkGray: '#0f0f0f',
      },
    },
  },
  plugins: [],
};
