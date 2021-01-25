const build = require('./build');

test('no duplication', async () => {
	const report = await build({
		'/index.js': `
		console.log('No duplication');
		`,
	});

	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

	expect(duplicationReport).toEqual({});
});

test('duplication', async () => {
	const report = await build({
		'/index.js': `
			import('./chunk-a');
			import('./chunk-b');
		`,
		'/chunk-a.js': `
			import './duplicated.js';
		`,
		'/chunk-b.js': `
			import './duplicated.js';
		`,
		'/duplicated.js': `
			console.log('Duplicated');
		`,
	});

	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

	expect(duplicationReport).toMatchObject({
		'/duplicated.js': {
			size: '33 B',
			'size-impact': '33 B',
			'included-in': [
				['0.js'],
				['1.js'],
			],
		},
	});
});

test('duplication with multi-file chunks', async () => {
	const report = await build({
		'/index.js': `
			import('./chunk-a');
			import('./chunk-b');
		`,
		'/chunk-a.js': `
			import './duplicated.js';
		`,
		'/chunk-b.js': `
			import './duplicated.js';
		`,
		'/duplicated.js': `
			console.log('Duplicated');
		`,
	}, (config) => {
		config.devtool = 'sourcemap';
	});

	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

	expect(duplicationReport).toMatchObject({
		'/duplicated.js': {
			size: '33 B',
			'size-impact': '33 B',
			'included-in': [
				['0.js', '0.js.map'],
				['1.js', '1.js.map'],
			],
		},
	});
});
