// tailwind.config.js

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Include the 'app' directory if using Next.js 13+ with the App Router
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        primary: '#6C5DD3', // Example primary color
      },
      // If you want custom 'backdrop-blur' sizes, you can keep this
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        // 'md', 'lg', 'xl', etc., are provided by default
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Add the filters plugin if using Tailwind CSS v2.x
    // require('@tailwindcss/filters'),
  ],
}
