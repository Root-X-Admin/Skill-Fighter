// tailwind.config.js
module.exports = {
  darkMode: 'class',
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
      animation: {
        fadeSlow: 'fade 5s ease-in-out infinite',
        pulseSlow: 'pulse 6s ease-in-out infinite',
        fadeIn: 'fadeIn 1.2s ease-out forwards',
        fadeUp: 'fadeUp 1s ease-out forwards',
        blinkLong: 'blinkLong 4s ease-in-out infinite',
        gradientShift: 'gradientShift 6s ease infinite',
        floatSlow: 'float 4s ease-in-out infinite', // ✅ Added
      },
      keyframes: {
        fade: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blinkLong: {
          '0%, 100%': {
            opacity: '0.6',
            backgroundImage: 'linear-gradient(90deg, #39ff14, #00f0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
          '50%': {
            opacity: '1',
            backgroundImage: 'linear-gradient(90deg, #ff00ff, #00ffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
        },
        gradientShift: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-6px)',
          },
        },
      },
    },
  },
  plugins: [],
};
