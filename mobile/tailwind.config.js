module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#0E0E14',
        neonBlue: '#7BE7FF',
        neonPurple: '#B77BFF',
        accent: '#7BE7FF',
      },
      borderRadius: {
        xl: '18px',
      },
    },
  },
  plugins: [],
};
