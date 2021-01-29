'use strict';

const byteSize = require('byte-size');

class AnalyzeDuplicationPlugin {
	apply(compiler) {
		const cwd = process.cwd();

		compiler.hooks.emit.tap('analyze-duplication-plugin', (compilation) => {
			const stats = compilation.getStats().toJson();
			const moduleMap = {};

			for (const chunk of stats.chunks) {
				const chunkId = JSON.stringify(chunk.files);

				for (const chunkModule of chunk.modules) {
					const identifier = chunkModule.identifier.replace(new RegExp(cwd, 'g'), '');

					if (!moduleMap[identifier]) {
						moduleMap[identifier] = {
							size: chunkModule.size,
							'potential-size-savings': Number.NaN,
							'included-in': [],
						};
					}

					if (!moduleMap[identifier]['included-in'].includes(chunkId)) {
						moduleMap[identifier]['included-in'].push(chunkId);
					}
				}
			}

			const duplications = Object.entries(moduleMap)
				.filter(([, d]) => d['included-in'].length > 1)
				.map(([module, data]) => ({
					module,
					size: data.size,
					'potential-size-savings': data.size * (data['included-in'].length - 1),
					'included-in': data['included-in'].sort(),
				}))
				.sort((d1, d2) => d2['potential-size-savings'] - d1['potential-size-savings']);

			const sizeProperties = new Set(['size', 'potential-size-savings']);
			const duplicationReportString = JSON.stringify(
				duplications,
				(key, value) => (sizeProperties.has(key) ? byteSize(value).toString() : value),
				4,
			)
				.replace(/"\[/g, '[')
				.replace(/]"/g, ']')
				.replace(/\\"/g, '"');

			compilation.assets['duplication-report.json'] = {
				source() {
					return duplicationReportString;
				},
				size() {
					return duplicationReportString.length;
				},
			};
		});
	}
}

module.exports = AnalyzeDuplicationPlugin;
