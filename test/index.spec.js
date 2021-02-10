const build = require('./build');

// test('no duplication', async () => {
// 	const report = await build({
// 		'/index.js': `
// 		console.log('No duplication');
// 		`,
// 	});

// 	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

// 	expect(duplicationReport).toEqual([]);
// });

// test('duplication', async () => {
// 	const report = await build({
// 		'/index.js': `
// 			import('./chunk-a');
// 			import('./chunk-b');
// 		`,
// 		'/chunk-a.js': `
// 			import './duplicated.js';
// 		`,
// 		'/chunk-b.js': `
// 			import './duplicated.js';
// 		`,
// 		'/duplicated.js': `
// 			console.log('Duplicated');
// 		`,
// 	});

// 	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

// 	expect(duplicationReport).toMatchObject([
// 		{
// 			module: '/duplicated.js',
// 			size: '33 B',
// 			'potential-size-savings': '33 B',
// 			'included-in': [
// 				['0.js'],
// 				['1.js'],
// 			],
// 		},
// 	]);
// });

// test('duplication with multi-file chunks', async () => {
// 	const report = await build({
// 		'/index.js': `
// 			import('./chunk-a');
// 			import('./chunk-b');
// 		`,
// 		'/chunk-a.js': `
// 			import './duplicated.js';
// 		`,
// 		'/chunk-b.js': `
// 			import './duplicated.js';
// 		`,
// 		'/duplicated.js': `
// 			console.log('Duplicated');
// 		`,
// 	}, (config) => {
// 		config.devtool = 'sourcemap';
// 	});

// 	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

// 	expect(duplicationReport).toMatchObject([
// 		{
// 			module: '/duplicated.js',
// 			size: '33 B',
// 			'potential-size-savings': '33 B',
// 			'included-in': [
// 				['0.js', '0.js.map'],
// 				['1.js', '1.js.map'],
// 			],
// 		},
// 	]);
// });

test('duplication with multi-entry multi-file chunks', async () => {
	const report = await build({
		'/entry-a.js': `
			import('./entry-a-chunk-a');
			import('./entry-a-chunk-b');
		`,
		'/entry-a-chunk-a.js': `
			import './entry-a-duplicated.js';
		`,
		'/entry-a-chunk-b.js': `
			import './entry-a-duplicated.js';
		`,
		'/entry-a-duplicated.js': `
			console.log('Duplicated');
		`,
		'/entry-b.js': `
			import('./entry-b-chunk-a');
		`,
		'/entry-b-chunk-a.js': `
			import('./entry-b-chunk-a-a');	
		`,
		'/entry-b-chunk-a-a.js': `
			console.log(1);
		`,
	}, (config) => {
		config.devtool = 'sourcemap';
		config.entry = {
			'entry-a': '/entry-a.js',
			'entry-b': '/entry-b.js',
		};
	});

	const duplicationReport = JSON.parse(report.compilation.compiler.outputFileSystem.readFileSync('/dist/duplication-report.json').toString());

	console.log(duplicationReport);
	expect(duplicationReport).toMatchObject([
		{
			module: '/duplicated.js',
			size: '33 B',
			'potential-size-savings': '33 B',
			'included-in': [
				['0.js', '0.js.map'],
				['1.js', '1.js.map'],
			],
		},
	]);
});
