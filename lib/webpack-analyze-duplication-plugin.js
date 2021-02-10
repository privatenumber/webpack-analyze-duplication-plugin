'use strict';

const byteSize = require('byte-size');

function findEntry(chunk, allChunks) {
	const entries = [];
	const queue = [{chunk, path: [chunk.id]}];
	let node;
	while (node = queue.shift()) {
		if (node.chunk.entry) {
			if (!entries.includes(node.chunk.names[0])) {
				entries.push(node.chunk.names[0]);
			}
		} else {
			for (const parentId of node.chunk.parents) {
				if (node.path.includes(parentId)) {
					continue;
				}
				const parentChunk = (
					typeof parentId === 'number'
						? allChunks[parentId]
						: allChunks.find(c => c.id === parentId)
				);
				queue.push({
					chunk: parentChunk,
					path: node.path.concat(parentId),
				});
			}
		}
	}
	return entries;
}

class AnalyzeDuplicationPlugin {
	apply(compiler) {
		const cwd = process.cwd();

		compiler.hooks.emit.tap('analyze-duplication-plugin', (compilation) => {
			const stats = compilation.getStats();
			const statsJson = stats.toJson();
			const moduleMap = {};

			for (const chunk of statsJson.chunks) {
				const chunkId = JSON.stringify(chunk.files);
				const inEntries = findEntry(chunk, statsJson.chunks);

				if (!inEntries.includes('site')) {
					continue;
				}

				for (const chunkModule of chunk.modules) {
					const identifier = chunkModule.identifier.replace(new RegExp(cwd, 'g'), '');

					if (!moduleMap[identifier]) {
						moduleMap[identifier] = {
							size: chunkModule.size,
							'potential-size-savings': Number.NaN,
							'included-in-chunks': [],
							'included-in-entries': [],
						};
					}

					if (!moduleMap[identifier]['included-in-chunks'].includes(chunkId)) {
						moduleMap[identifier]['included-in-chunks'].push(chunkId);
					}

					for (const entryId of inEntries) {
						if (!moduleMap[identifier]['included-in-entries'].includes(entryId)) {
							moduleMap[identifier]['included-in-entries'].push(entryId);
						}	
					}
				}
			}

			const duplications = Object.entries(moduleMap)
				.map(([module, data]) => ({
					module,
					size: data.size,
					'potential-size-savings': data.size * (data['included-in-chunks'].length - 1),
					'included-in-chunks': data['included-in-chunks'].sort(),
					'included-in-entries': data['included-in-entries'].sort(),
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
