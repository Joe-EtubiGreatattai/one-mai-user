module.exports = {
  darkMode: "class",
  important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Add this important configuration
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles if conflicting
  },
  theme: {
    extend: {
      // Ensure your color scheme matches
      colors: {
        dark: {
          background: "#1a202c",
          text: "#f7fafc",
          signupPrimary: "#3390D5",
          // Add other dark mode colors as needed
        },
      },
    },
  },
  plugins: [],
};
