const path = require('path');
const fs = require('fs-extra');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const virtualModules = new VirtualModulesPlugin();
const env = require('./env');
const { getModuleList } = require('./utils');
const camelCase = require('@kne/camel-case');
const buildComponentDocs = require('./build-component-docs');

const ReadmeWebpackPlugin_MODULE_NAMES = 'ReadmeWebpackPlugin_MODULE_NAMES';

/** 将 README.md 拷到 webpack 输出目录（与 remoteEntry.js 同级），供 CDN/文档搜索访问。 */
const copyReadmeToOutput = async ({ readmePath, outputPath }) => {
  if (!(await fs.pathExists(readmePath))) {
    return false;
  }
  await fs.ensureDir(outputPath);
  await fs.copy(readmePath, path.join(outputPath, 'README.md'));
  return true;
};

class ReadmeWebpackPlugin {
  constructor(options) {
    this.options = Object.assign({}, options);
  }

  apply(compiler) {
    virtualModules.apply(compiler);
    compiler.hooks.beforeRun.tapPromise('ReadmeWebpackPlugin', async (compilationParams) => {
      if (compilationParams.options.mode === 'production') {
        await buildComponentDocs({
          moduleBaseDir: env.moduleBaseDir,
          rootReadme: path.resolve(env.appDir, 'README.md'),
          getModuleList: this.options.getModuleList || getModuleList
        });
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
    // production 打包结束后把 README.md 写入输出目录，避免 CDN 上仅有 remoteEntry 而无文档
    compiler.hooks.afterEmit.tapPromise('ReadmeWebpackPlugin', async () => {
      if (compiler.options.mode !== 'production') {
        return;
      }
      const readmePath = this.options.readmePath || path.resolve(env.appDir, 'README.md');
      await copyReadmeToOutput({ readmePath, outputPath: compiler.outputPath });
    });
  }
}

module.exports = ReadmeWebpackPlugin;
module.exports.copyReadmeToOutput = copyReadmeToOutput;
