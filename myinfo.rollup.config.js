//import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/myinfo.js',
	output: {
		file: 'public/myinfo.js',
		format: 'iife',
		name: 'myinfo',
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
