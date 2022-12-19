const {stringify} = require("@kne/md-doc");
const path = require("path");
const fs = require("fs-extra");
const readmeGenerator = require("./readme-generator");
const VirtualModulesPlugin = require('webpack-virtual-modules');
const chokidar = require("chokidar");
const virtualModules = new VirtualModulesPlugin();

class ReadmeResolvePlugin {
    apply(resolver) {
        const target = resolver.ensureHook('module');
        resolver
            .getHook('after-rawModule')
            .tapAsync("ReadmeResolvePlugin", (request, resolveContext, callback) => {
                // Any logic you need to create a new `request` can go here
                console.log(request);
                resolver.doResolve(target, request, null, resolveContext, callback);
            });
    }
}

class ReadmeWebpackPlugin {
    apply(compiler) {
        compiler.hooks.afterResolvers.tap('ReadmeWebpackPlugin', (compiler) => {
            console.log('zzzzz');
            compiler.options.resolve.plugins.push(new ReadmeResolvePlugin());
        });
        compiler.hooks.watchClose.tap('ReadmeWebpackPlugin', () => {
            fs.writeJson('.log.json', {aaa: 111});
        });
        /*compiler.hooks.make.tapPromise("ReadmeWebpackPlugin", async (compilation) => {
           const rootDir = path.resolve(process.cwd(), "./src/modules");
           console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>make');
            const list = await fs.readdir(rootDir);
            const output = {};
            for (let name of list) {
                const docDir = path.resolve(rootDir, name, "doc");
                if (await fs.exists(docDir) && (await fs.readdir(docDir)).length > 0) {
                    output[name] = await stringify({baseDir: path.resolve(rootDir, name), name});
                }
            }
            virtualModules.writeModule('node_modules/readme.js', readmeGenerator(output));
        });*/
    }
}

module.exports = ReadmeWebpackPlugin;