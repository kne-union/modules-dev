const path = require('path');
const env = require('./env');
const ComponentsCssModulesPlugin = require('./craco-components-css-modules');
const ReadmePlugin = require('./craco-readme-plugin');
const LibExampleVersionPlugin = require('./lib-example-version-webpack-plugin');
const CracoModuleFederation = require("@kne/craco-module-federation");

module.exports = {
    overrideCracoConfig: ({cracoConfig, context}) => {
        const packageJson = require(path.resolve(env.appDir, '../package.json'));
        process.env.PUBLIC_URL = env.publicUrl;
        process.env.CURRENT_VERSION = packageJson.version;
        context.packagePureName = packageJson.name.split('/')[1] || packageJson.name;
        context.packageJson = packageJson;
        cracoConfig.plugins.push({
            plugin: ReadmePlugin, options: {
                getModuleList: () => {
                    return [{
                        name: context.packagePureName,
                        dir: path.resolve(env.appDir, '../doc'),
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
        }, {plugin: ComponentsCssModulesPlugin}, {plugin: CracoModuleFederation});
        return cracoConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [`${env.moduleAliasName}/${context.packagePureName}/README.md`]: path.resolve(env.appDir, '../README.md')
        });
        if (context.env === 'production') {
            webpackConfig.plugins.push(new LibExampleVersionPlugin());
        }
        return webpackConfig;
    }
};
