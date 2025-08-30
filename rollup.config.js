import { glob } from 'glob';

const miniblockFiles = glob.sync('src/Miniblocks/**/*.js');

export default [
	...miniblockFiles.map(file => {
		const name = file.split('\\')
			.pop()
			.split('/')
			.pop()
			.replace('.js', '')
			.replace('_miniblock-', '');

		return {
			input: file,
			output: {
				file: `dist/${name}.dist.js`,
				format: 'iife',
				sourcemap: true,
			},
			plugins: []
		};
	}),
	{
		input: 'src/Tables/tables.js',
		output: {
			file: 'dist/tables.dist.js',
			format: 'iife',
			sourcemap: true,
		},
		plugins: []
	}
];
