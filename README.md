# webpack-analyze-duplication-plugin [![Latest version](https://badgen.net/npm/v/webpack-analyze-duplication-plugin)](https://npm.im/webpack-analyze-duplication-plugin) [![Monthly downloads](https://badgen.net/npm/dm/webpack-analyze-duplication-plugin)](https://npm.im/webpack-analyze-duplication-plugin) [![Install size](https://packagephobia.now.sh/badge?p=webpack-analyze-duplication-plugin)](https://packagephobia.now.sh/result?p=webpack-analyze-duplication-plugin)

Detect duplicated modules in your Webpack build.

Produce a `duplication-report.json` that contains a full-report on duplicated modules.

Example snippet:
```json5
{
	// The duplicated module path
	"/node_modules/vue/dist/vue.esm.js": {

		// Size of module
		"size": "326.4 kB",

		// Size savings if de-duped
		"sizeImpact": "979.2 kB",

		// Chunks the module is duplicated in
		"includedIn": [
			["index.js"],
			["some-file.js"],
			...
		]
	},

	...
}
```

<sub>If you like this project, please star it & [follow me](https://github.com/privatenumber) to see what other cool projects I'm working on! ❤️</sub>

## 🙋‍♂️ Why?
Webpack configuration is complicated. It's easy to overlook misconfigurations and bloated distribution bundles.

Use this plugin to make sure there are no duplicated modules, or that they're only duplicated where you want them to be.

## 🚀 Install
```sh
npm i -D webpack-analyze-duplication-plugin
```

## 🚦 Quick Setup
Add to your `webpack.config.js`:

```diff
+ const AnalyzeDuplicationPlugin = require('webpack-analyze-duplication-plugin')

  module.exports = {
	  ...

      plugins: [
+         new AnalyzeDuplicationPlugin()
      ]
  }
```

## 👨‍👩‍👦‍👦 Related

- [webpack-distsize](https://github.com/privatenumber/webpack-distsize) - Track Webpack output size via version control
- [webpack-dependency-size](https://github.com/privatenumber/webpack-dependency-size) - Webpack plugin to get an overview of bundled dependencies and their size
