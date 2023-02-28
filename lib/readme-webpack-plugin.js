const path = require("path");
const fs = require("fs-extra");
const {stringify} = require("@kne/md-doc");
const VirtualModulesPlugin = require('webpack-virtual-modules');
const virtualModules = new VirtualModulesPlugin();
const {moduleBaseDir, moduleAliasName} = require('./env');

const ReadmeWebpackPlugin_MODULE_NAMES = 'ReadmeWebpackPlugin_MODULE_NAMES';
const getModuleNames = async (params) => {
    try {
        const list = await fs.readdir(moduleBaseDir);
        const moduleNames = [];
        for (let name of list) {
            if (await fs.exists(path.resolve(moduleBaseDir, name, 'README.md'))) {
                moduleNames.push(name);
            }
        }
        params[ReadmeWebpackPlugin_MODULE_NAMES] = moduleNames;
    } catch (e) {
        throw e;
    }
};

class ReadmeWebpackPlugin {
    apply(compiler) {
        virtualModules.apply(compiler);
        compiler.hooks.beforeRun.tapPromise('ReadmeWebpackPlugin', async (compilationParams) => {
            if (compilationParams.options.mode === 'production') {
                const list = await fs.readdir(moduleBaseDir);
                for (let name of list) {
                    const docDir = path.resolve(moduleBaseDir, name, "doc");
                    if (await fs.exists(docDir) && (await fs.readdir(moduleBaseDir)).length > 0) {
                        await stringify({baseDir: path.resolve(moduleBaseDir, name), name});
                    }
                }
            }
        });
        compiler.hooks.beforeCompile.tapPromise("ReadmeWebpackPlugin", getModuleNames);
        compiler.hooks.compilation.tap("ReadmeWebpackPlugin", async (compilation) => {
            const moduleNames = compilation.params[ReadmeWebpackPlugin_MODULE_NAMES];
            virtualModules.writeModule('node_modules/readme/index.js', `${moduleNames.map((name) => `import ${name} from '${moduleAliasName}/${name}/README.md';`).join('\n')}export default {${moduleNames.join(',')}};`);
        });
    }
}

module.exports = ReadmeWebpackPlugin;