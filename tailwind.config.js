/** @type {import('tailwindcss').Config} */
module.exports ={
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'selector',
	theme: {
		extend: {},
		fontFamily: {
			sans: [
				'Rubik',
				'ui-sans-serif',
				'system-ui',
				'-apple-system',
				'BlinkMacSystemFont',
				'Segoe UI',
				'Roboto',
				'Helvetica Neue',
				'Arial',
				'Noto Sans',
				'sans-serif',
				'Apple Color Emoji',
				'Segoe UI Emoji',
				'Segoe UI Symbol',
				'Noto Color Emoji'
			]
		}
	},
	future: {
		purgeLayersByDefault: true,
		removeDeprecatedGapUtilities: true
	},
	plugins: [require('@tailwindcss/typography')]
};
