const path = require("path");
const fs = require("fs-extra");
const {stringify} = require("@kne/md-doc");
const VirtualModulesPlugin = require('webpack-virtual-modules');
const virtualModules = new VirtualModulesPlugin();
const {
    manifestPath, moduleBaseDir, moduleAliasName, componentsName, componentsVersion, openComponentsVersion, publicUrl
} = require('./env');
const {getModuleList} = require('./utils');

const ReadmeWebpackPlugin_MODULE_NAMES = 'ReadmeWebpackPlugin_MODULE_NAMES';

class ReadmeWebpackPlugin {
    apply(compiler) {
        virtualModules.apply(compiler);
        compiler.hooks.beforeRun.tapPromise('ReadmeWebpackPlugin', async (compilationParams) => {
            if (compilationParams.options.mode === 'production') {
                const list = await getModuleList(moduleBaseDir);
                await Promise.all(list.map((name) => stringify({baseDir: path.resolve(moduleBaseDir, name), name})));
            }
        });
        compiler.hooks.beforeCompile.tapPromise("ReadmeWebpackPlugin", async (params) => {
            params[ReadmeWebpackPlugin_MODULE_NAMES] = await getModuleList(moduleBaseDir);
        });
        compiler.hooks.compilation.tap("ReadmeWebpackPlugin", async (compilation) => {
            const moduleNames = compilation.params[ReadmeWebpackPlugin_MODULE_NAMES];
            const readmes = `${moduleNames.map((name) => `import ${name} from '${moduleAliasName}/${name}/README.md';`).join('\n')}export default {${moduleNames.join(',')}};`;
            virtualModules.writeModule(manifestPath, readmes + `\nexport const manifest = ${JSON.stringify(Object.assign({
                "name": componentsName,
                "version": componentsVersion,
                "open-version": openComponentsVersion,
                "public-url": publicUrl,
                "modules": moduleNames
            }))};`);
            virtualModules.writeModule('node_modules/readme/index.js', readmes);
        });
    }
}

module.exports = ReadmeWebpackPlugin;