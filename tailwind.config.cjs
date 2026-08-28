/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff69b4",
        secondary: "#fb923c",
        danger: "#DC2626",
        statusBar: "#212121",
        success: "#16A34A",
        error: "#ef4444",
        background: "#2f2f2f",
        gold: "#FFC94D",
        silver: "#D9D9D9",
        bronze: "#D98C3F",
        surface: "#151515",
        ink: "#090909"
      },
      fontFamily: {
        title: ["MonumentExtended-Ultrabold", "Arial Black", "sans-serif"],
        subtitle: ["Montserra-Bold", "Montserrat", "Arial", "sans-serif"],
        body: ["Montserra-Medium", "Montserrat", "Arial", "sans-serif"],
        text: ["Montserra-Regular", "Montserrat", "Arial", "sans-serif"],
        subtext: ["Montserra-Light", "Montserrat", "Arial", "sans-serif"]
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "5rem"
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        full: "9999px"
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px"
      },
      boxShadow: {
        orange: "0 22px 80px rgba(251, 146, 60, 0.18)",
        pink: "0 22px 80px rgba(255, 105, 180, 0.15)"
      }
    }
  },
  plugins: []
};
