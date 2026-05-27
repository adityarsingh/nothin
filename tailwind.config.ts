import type { Config } from "tailwindcss";

// Note: In Tailwind CSS v4, theme configuration is primarily handled via CSS variables 
// and the @theme directive in globals.css. This file is kept for compatibility with 
// tools that still expect a tailwind.config.ts or for plugins.

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Tokens are defined in styles/globals.css using the Tailwind v4 @theme directive
    },
  },
  plugins: [],
};
export default config;
