const path = require('path');
const env = require('./env');
const examplePackageJson = require(path.resolve(env.appDir, 'package.json'));
const fs = require('fs-extra');

class LibExampleVersionPlugin {
  apply(compiler) {
    const packageJson = require(path.resolve(env.appDir, '../package.json'));
    compiler.hooks.done.tapPromise('LibExampleVersionPlugin', async (compilationParams) => {
      await fs.writeJson(path.resolve(env.appDir, 'package.json'), Object.assign({}, examplePackageJson, { version: packageJson.version }), { spaces: 2 });
    });
  }
}

module.exports = LibExampleVersionPlugin;
