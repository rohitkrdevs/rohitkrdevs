/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],

	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
			},

			colors: {
				background: "var(--bg)",
				foreground: "var(--fg)",
			},
		},
	},

	plugins: [],
};
