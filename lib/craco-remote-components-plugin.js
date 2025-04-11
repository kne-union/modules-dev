const path = require("path");
const env = require("./env");

module.exports = {
    overrideCracoConfig: ({cracoConfig, pluginOptions}) => {
        process.env.PUBLIC_URL = env.publicUrl;
        cracoConfig.plugins.push({
            plugin: require("./craco-readme-plugin"), options: {
                watchTarget: path.resolve(env.moduleBaseDir, "./*/doc/**/*"), watchCallback: ({dir}) => {
                    const name = path.relative(env.moduleBaseDir, dir).split(path.sep)[0];
                    return {
                        name, baseDir: path.resolve(env.moduleBaseDir, name)
                    }
                }
            }
        }, {plugin: require("./craco-components-css-modules")}, {
            plugin: require('@kne/craco-module-federation'), options: {
                additionalPaths: [path.resolve(__dirname, './modulefederation.config.js')],
                middleware: pluginOptions?.middleware
            }
        }, {
            plugin: require('./craco-fix-plugin'), options: {}
        });
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
