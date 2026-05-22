/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          light: "#f3f6f4", // Background light
        },
        brown: {
          medium: "#2d3a2a", // Medium dark green / Surface
          dark: "#4b5b47",   // Body text green
        },
        gold: {
          accent: "#85AB8B", // Heading accent green
        },
        crimson: {
          accent: "#336443", // Heading primary
        },
        brand: {
          dark: "#1f2a1d",
          hover: "#2a3827",
          bottomBg: "#3d5638",
          bottomHover: "#2d4228",
        }
      },
      fontFamily: {
        charm: ["Charm", "cursive"],
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        heritage: "0px 15px 35px rgba(31, 42, 29, 0.08)",
        spiritual: "0px 0px 20px rgba(133, 171, 139, 0.5)",
      }
    },
  },
  plugins: [],
};
