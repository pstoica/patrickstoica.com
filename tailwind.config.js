/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	theme: {
		extend: {}
	},
	future: {
		purgeLayersByDefault: true,
		removeDeprecatedGapUtilities: true
	},
	plugins: [require('@tailwindcss/typography')]
};
