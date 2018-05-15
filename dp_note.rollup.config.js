//import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/dp_note.js',
	output: {
		file: 'public/dp_note.js',
		format: 'umd',
		name: 'dp_note',
		sourcemap: 'inline',
		strict: true,
		globals: {
			jquery: '$'
		}
	},

	plugins: [
		production && uglify() // minify, but only in production
/*		babel({
			exclude: 'node_modules/**'
		})*/
	]
};
