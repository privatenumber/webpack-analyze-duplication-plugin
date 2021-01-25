'use strict';

const fromEntries = require('fromentries');
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
							'size-impact': Number.NaN,
							'included-in': [],
						};
					}

					if (!moduleMap[identifier]['included-in'].includes(chunkId)) {
						moduleMap[identifier]['included-in'].push(chunkId);
					}
				}
			}

			const duplicatedModules = Object.entries(moduleMap)
				.filter(([, d]) => d['included-in'].length > 1);

			duplicatedModules.forEach(([, data]) => {
				data['included-in'].sort();
				data['size-impact'] = data.size * (data['included-in'].length - 1);
			});

			const duplicationReport = fromEntries(
				duplicatedModules.sort(
					([, d1], [, d2]) => d2['size-impact'] - d1['size-impact'],
				),
			);

			const sizeProperties = new Set(['size', 'size-impact']);
			const duplicationReportString = JSON.stringify(
				duplicationReport,
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
