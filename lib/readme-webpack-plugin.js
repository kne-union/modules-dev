const path = require('path');
const fs = require('fs-extra');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const virtualModules = new VirtualModulesPlugin();
const env = require('./env');
const { getModuleList } = require('./utils');
const camelCase = require('@kne/camel-case');
const buildComponentDocs = require('./build-component-docs');

const ReadmeWebpackPlugin_MODULE_NAMES = 'ReadmeWebpackPlugin_MODULE_NAMES';

/** 将虚拟 readme 同步到磁盘（内容不变则不写，避免 watch 循环）。 */
const writeReadmeFilesIfChanged = (files) => {
  fs.ensureDirSync(env.readmeDir);
  Object.entries(files).forEach(([file, content]) => {
    let prev = null;
    try {
      prev = fs.readFileSync(file, 'utf8');
    } catch (e) {
      prev = null;
    }
    if (prev !== content) {
      fs.writeFileSync(file, content);
    }
  });
};

/** 将完整聚合文档写入 webpack 输出目录的 README.md（与 remoteEntry.js 同级）。 */
const writeFullReadmeToOutput = async ({ content, outputPath }) => {
  if (content == null || content === '') {
    return false;
  }
  await fs.ensureDir(outputPath);
  await fs.writeFile(path.join(outputPath, 'README.md'), content);
  return true;
};

class ReadmeWebpackPlugin {
  constructor(options) {
    this.options = Object.assign({}, options);
    this._fullReadme = '';
  }

  apply(compiler) {
    virtualModules.apply(compiler);
    compiler.hooks.beforeRun.tapPromise('ReadmeWebpackPlugin', async (compilationParams) => {
      if (compilationParams.options.mode === 'production') {
        const docsDir = this.options.docsDir || path.resolve(env.appDir, 'docs');
        // readmePath：仅用于更新仓库根 README 的 DOC_MD 目录表，不是 build 输出源
        const rootReadme = this.options.readmePath || path.resolve(env.appDir, 'README.md');
        const result = await buildComponentDocs({
          moduleBaseDir: env.moduleBaseDir,
          rootReadme,
          docsDir,
          getModuleList: this.options.getModuleList || getModuleList
        });
        this._fullReadme = result.fullReadme || '';
      }
    });
    compiler.hooks.beforeCompile.tapPromise('ReadmeWebpackPlugin', async (params) => {
      params[ReadmeWebpackPlugin_MODULE_NAMES] = await (this.options.getModuleList || getModuleList)(env.moduleBaseDir);
    });
    compiler.hooks.compilation.tap('ReadmeWebpackPlugin', async (compilation) => {
      const moduleNames = compilation.params[ReadmeWebpackPlugin_MODULE_NAMES];
      const readmes = `${moduleNames.map(({ name }) => `import ${camelCase(name)} from '${env.moduleAliasName}/${name}/README.md';`).join('\n')}export default {${moduleNames.map(({ name }) => camelCase(name)).join(',')}};`;

      const manifestSource = readmes + `\nexport const manifest = ${JSON.stringify(Object.assign({
        'name': env.componentsName,
        'version': env.componentsVersion,
        'open-version': env.openComponentsVersion,
        'public-url': env.publicUrl,
        'modules': moduleNames
      }))};`;
      virtualModules.writeModule(env.manifestPath, manifestSource);
      virtualModules.writeModule(env.readmeIndexPath, readmes);
      writeReadmeFilesIfChanged({
        [env.readmeIndexPath]: readmes,
        [env.manifestPath]: manifestSource,
        [path.join(env.readmeDir, 'package.json')]: JSON.stringify({
          name: 'readme',
          main: 'index.js',
          private: true
        })
      });
    });
    // production：写入完整聚合 README.md（与根目录 TOC 版 README 无关）
    compiler.hooks.afterEmit.tapPromise('ReadmeWebpackPlugin', async () => {
      if (compiler.options.mode !== 'production') {
        return;
      }
      await writeFullReadmeToOutput({
        content: this._fullReadme,
        outputPath: compiler.outputPath
      });
    });
  }
}

module.exports = ReadmeWebpackPlugin;
module.exports.writeFullReadmeToOutput = writeFullReadmeToOutput;
