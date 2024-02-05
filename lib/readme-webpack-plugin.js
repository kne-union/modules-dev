const path = require('path');
const fs = require('fs-extra');
const { stringify } = require('@kne/md-doc');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const virtualModules = new VirtualModulesPlugin();
const env = require('./env');
const { getModuleList } = require('./utils');
const camelCase = require('@kne/camel-case');

const ReadmeWebpackPlugin_MODULE_NAMES = 'ReadmeWebpackPlugin_MODULE_NAMES';

class ReadmeWebpackPlugin {
  constructor(options) {
    this.options = Object.assign({}, options);
  }

  apply(compiler) {
    virtualModules.apply(compiler);
    compiler.hooks.beforeRun.tapPromise('ReadmeWebpackPlugin', async (compilationParams) => {
      if (compilationParams.options.mode === 'production') {
        const list = await (this.options.getModuleList || getModuleList)(env.moduleBaseDir);
        await Promise.all(list.map(({ name, dir, ...props }) => stringify({ baseDir: dir, name, ...props })));
      }
    });
    compiler.hooks.beforeCompile.tapPromise('ReadmeWebpackPlugin', async (params) => {
      params[ReadmeWebpackPlugin_MODULE_NAMES] = await (this.options.getModuleList || getModuleList)(env.moduleBaseDir);
    });
    compiler.hooks.compilation.tap('ReadmeWebpackPlugin', async (compilation) => {
      const moduleNames = compilation.params[ReadmeWebpackPlugin_MODULE_NAMES];
      const readmes = `${moduleNames.map(({ name }) => `import ${camelCase(name)} from '${env.moduleAliasName}/${name}/README.md';`).join('\n')}export default {${moduleNames.map(({ name }) => camelCase(name)).join(',')}};`;

      virtualModules.writeModule(env.manifestPath, readmes + `\nexport const manifest = ${JSON.stringify(Object.assign({
        'name': env.componentsName,
        'version': env.componentsVersion,
        'open-version': env.openComponentsVersion,
        'public-url': env.publicUrl,
        'modules': moduleNames
      }))};`);
      virtualModules.writeModule('node_modules/readme/index.js', readmes);
    });
  }
}

module.exports = ReadmeWebpackPlugin;
