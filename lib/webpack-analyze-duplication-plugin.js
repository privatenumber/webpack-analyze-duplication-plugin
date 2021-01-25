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
							sizeImpact: Number.NaN,
							includedIn: [],
						};
					}

					if (!moduleMap[identifier].includedIn.includes(chunkId)) {
						moduleMap[identifier].includedIn.push(chunkId);
					}
				}
			}

			const duplicatedModules = Object.entries(moduleMap)
				.filter(([, { includedIn }]) => includedIn.length > 1);

			duplicatedModules.forEach(([, data]) => {
				data.includedIn.sort();
				data.sizeImpact = data.size * (data.includedIn.length - 1);
			});

			const duplicationReport = fromEntries(
				duplicatedModules.sort(
					([, d1], [, d2]) => d2.sizeImpact - d1.sizeImpact,
				),
			);

			const sizeProperties = new Set(['size', 'sizeImpact']);
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
