const path = require('path');
const componentsCssModules = require('./components-css-modules');
const env = require('./env');

const addReadmeLoader = require('./add-readme-loader');
const watchDocDir = require('./watch-doc-dir');
const LibExampleVersionPlugin = require('./lib-example-version-plugin');

const ReadmePlugin = {
    overrideCracoConfig: ({cracoConfig, context}) => {
        const packageJson = require(path.resolve(env.appDir, '../package.json'));
        process.env.PUBLIC_URL = env.publicUrl;
        process.env.CURRENT_VERSION = packageJson.version;
        context.packagePureName = packageJson.name.split('/')[1] || packageJson.name;
        return cracoConfig;
    }, overrideDevServerConfig: ({devServerConfig, context}) => {
        devServerConfig = watchDocDir({devServerConfig}, {
            target: path.resolve(env.appDir, '../doc/**/*'), callback: () => {
                return {
                    name: context.packagePureName, baseDir: path.resolve(env.appDir, '../')
                };
            }
        });

        return devServerConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig = componentsCssModules({webpackConfig, context});
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [`${env.moduleAliasName}/${context.packagePureName}/README.md`]: path.resolve(env.appDir, '../README.md')
        });
        webpackConfig = addReadmeLoader({webpackConfig, context}, {
            getModuleList: () => {
                return [{name: context.packagePureName, dir: path.resolve(env.appDir, '../doc')}];
            }
        });

        if (context.env === 'production') {
            webpackConfig.plugins.push(new LibExampleVersionPlugin());
        }

        return webpackConfig;
    }
};

module.exports = ReadmePlugin;
