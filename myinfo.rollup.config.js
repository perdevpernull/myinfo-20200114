//import babel from 'rollup-plugin-babel';

export default {
	input: 'src/myinfo.js',
	output: {
		file: 'build/myinfo.js',
		format: 'umd',
		name: 'myinfo',
		sourcemap: 'inline',
		strict: true
	},

	plugins: [
/*		babel({
			exclude: 'node_modules/**'
		})*/
	]
};
