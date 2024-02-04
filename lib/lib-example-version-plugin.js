const path = require('path');
const { appDir } = require('./env');
const packageJson = require(path.resolve(appDir, '../package.json'));
const examplePackageJson = require(path.resolve(appDir, 'package.json'));
const fs = require('fs-extra');

class LibExampleVersionPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise('LibExampleVersionPlugin', async (compilationParams) => {
      await fs.writeJson(path.resolve(appDir, 'package.json'), Object.assign({}, examplePackageJson, { version: packageJson.version }), { spaces: 2 });
    });
  }
}

module.exports = LibExampleVersionPlugin;
