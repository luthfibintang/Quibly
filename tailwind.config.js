/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1C1C1E',
        secondary: '#969696',
        kindaBlack: '#303030',
        mainPurple: '#7A38F6',
      }
    },
  },
  plugins: [],
}