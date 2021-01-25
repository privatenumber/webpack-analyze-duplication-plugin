const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { ufs } = require('unionfs');
const { Volume } = require('memfs');
const AnalyzeDuplicationPlugin = require('..');

function build(volJson, configure) {
	return new Promise((resolve, reject) => {
		const mfs = Volume.fromJSON(volJson);

		mfs.join = path.join.bind(path);

		const config = {
			mode: 'development',

			devtool: false,

			bail: true,

			context: '/',

			entry: {
				index: '/index.js',
			},

			output: {
				path: '/dist',
				filename: '[name].js',
				chunkFilename: '[name].js',
				libraryTarget: 'commonjs2',
			},

			plugins: [
				new AnalyzeDuplicationPlugin(),
			],
		};

		if (typeof configure === 'function') {
			configure(config);
		}

		const compiler = webpack(config);

		compiler.inputFileSystem = ufs.use(fs).use(mfs);
		compiler.outputFileSystem = mfs;

		compiler.run((error, stats) => {
			if (error) {
				reject(error);
				return;
			}

			if (stats.compilation.errors.length > 0) {
				reject(new Error(stats.compilation.errors[0]));
				return;
			}

			if (stats.compilation.warnings.length > 0) {
				reject(new Error(stats.compilation.warnings[0]));
				return;
			}

			resolve(stats);
		});
	});
}

module.exports = build;
