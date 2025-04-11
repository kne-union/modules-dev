const path = require('path');
const env = require('./env');

module.exports = {
    overrideCracoConfig: ({cracoConfig, context, pluginOptions}) => {
        const packageJson = require(path.resolve(env.appDir, '../package.json'));
        process.env.PUBLIC_URL = env.publicUrl;
        process.env.CURRENT_VERSION = packageJson.version;
        context.packagePureName = packageJson.name.split('/')[1] || packageJson.name;
        context.packageJson = packageJson;
        cracoConfig.plugins.push({
            plugin: require('./craco-readme-plugin'), options: {
                getModuleList: () => {
                    return [{
                        name: context.packagePureName,
                        baseDir: path.resolve(env.appDir, '../'),
                        description: context.packageJson.description,
                        packageName: context.packageJson.name
                    }];
                }, loaderOptions: {
                    description: context.packageJson.description, packageName: context.packageJson.name
                }, watchTarget: path.resolve(env.appDir, '../doc/**/*'), watchCallback: () => {
                    return {
                        name: context.packagePureName,
                        baseDir: path.resolve(env.appDir, '../'),
                        description: context.packageJson.description,
                        packageName: context.packageJson.name
                    };
                }
            }
        }, {plugin: require('./craco-components-css-modules')}, {
            plugin: require("@kne/craco-module-federation"), options: {
                additionalPaths: [path.resolve(__dirname, './modulefederation.config.js')],
                middleware: pluginOptions?.middleware
            }
        }, {
            plugin: require('./craco-fix-plugin'), options: {}
        });
        return cracoConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [`${env.moduleAliasName}/${context.packagePureName}/README.md`]: path.resolve(env.appDir, '../README.md')
        });
        if (context.env === 'production') {
            const LibExampleVersionPlugin = require('./lib-example-version-webpack-plugin');
            webpackConfig.plugins.push(new LibExampleVersionPlugin());
        }
        return webpackConfig;
    }
};
