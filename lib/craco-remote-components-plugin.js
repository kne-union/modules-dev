const CracoModuleFederation = require('@kne/craco-module-federation');
const path = require("path");
const env = require("./env");
const ReadmePlugin = require("./craco-readme-plugin");
const ComponentsCssModulesPlugin = require("./craco-components-css-modules");

module.exports = {
    overrideCracoConfig: ({cracoConfig}) => {
        process.env.PUBLIC_URL = env.publicUrl;
        cracoConfig.plugins.push({
            plugin: ReadmePlugin, options: {
                watchTarget: path.resolve(env.moduleBaseDir, "./*/doc/**/*"), watchCallback: ({dir}) => {
                    const name = path.relative(env.moduleBaseDir, dir).split(path.sep)[0];
                    return {
                        name, baseDir: path.resolve(env.moduleBaseDir, name)
                    }
                }
            }
        }, {plugin: ComponentsCssModulesPlugin}, {plugin: CracoModuleFederation});
        return cracoConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [env.moduleAliasName]: env.moduleBaseDir
        })
        const definePlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "DefinePlugin");
        Object.assign(definePlugin.definitions["process.env"], {STATIC_BASE_URL: `"${env.staticBaseUrl}"`});
        return webpackConfig;
    }
};
