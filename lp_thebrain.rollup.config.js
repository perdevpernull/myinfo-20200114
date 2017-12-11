//import babel from 'rollup-plugin-babel';

export default {
	input: 'src/lp_thebrain.js',
	output: {
		file: 'build/lp_thebrain.js',
		format: 'umd',
		name: 'lp_thebrain',
		sourcemap: 'inline',
		strict: true
	},

	plugins: [
/*		babel({
			exclude: 'node_modules/**'
		})*/
	]
};
