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
			sizeImpact: '33 B',
			includedIn: [
				['0.js'],
				['1.js'],
			],
		},
	});
});
