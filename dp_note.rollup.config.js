//import babel from 'rollup-plugin-babel';

export default {
	input: 'src/dp_note.js',
	output: {
		file: 'build/dp_note.js',
		format: 'umd',
		name: 'dp_note',
		sourcemap: 'inline',
		strict: true
	},

	plugins: [
/*		babel({
			exclude: 'node_modules/**'
		})*/
	]
};
