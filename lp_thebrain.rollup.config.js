//import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/lp_thebrain.js',
	output: {
		file: 'public/lp_thebrain.js',
		format: 'umd',
		name: 'lp_thebrain',
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
