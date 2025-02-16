import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: "#E5F2F4", // Light blue background
  			foreground: "#001524", // rich_black
  			primary: {
  				DEFAULT: "#15616D", // caribbean_current
  				foreground: "#FFFFFF",
  			},
  			muted: {
  				DEFAULT: "#B8DDE2", // Lighter caribbean_current
  				foreground: "#001524",
  			},
  			accent: {
  				DEFAULT: "#FF7D00", // orange_wheel
  				foreground: "#001524",
  			},
  			card: {
  				DEFAULT: "#F5FAFB", // Very light blue
  				foreground: "#001524",
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			table: {
  				header: "#15616D", // caribbean_current for table header
  				row: "#D0E8EC", // Medium blue for alternating rows
  			},
  			tabs: {
  				DEFAULT: "#15616D", // caribbean_current for active tab
  				inactive: "#D0E8EC", // Medium blue for inactive tabs
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
