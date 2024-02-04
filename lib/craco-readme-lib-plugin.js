const path = require('path');
const componentsCssModules = require('./components-css-modules');
const env = require('./env');
const packageJson = require(path.resolve(env.appDir, '../package.json'));
const addReadmeLoader = require('./add-readme-loader');
const watchDocDir = require('./watch-doc-dir');
const packagePureName = packageJson.name.split('/')[1] || packageJson.name;
const LibExampleVersionPlugin = require('./lib-example-version-plugin');

process.env.PUBLIC_URL = env.publicUrl;
process.env.CURRENT_VERSION = packageJson.version;

const ReadmePlugin = {
    overrideDevServerConfig: ({devServerConfig}) => {
        devServerConfig = watchDocDir({devServerConfig}, {
            target: path.resolve(env.appDir, '../doc/**/*'),
            name: packagePureName,
            baseDir: path.resolve(env.appDir, '../')
        });

        return devServerConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig = componentsCssModules({webpackConfig, context});
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [`${env.moduleAliasName}/${packagePureName}/README.md`]: path.resolve(env.appDir, '../README.md')
        });
        webpackConfig = addReadmeLoader({webpackConfig, context}, {
            getModuleList: () => {
                return [{name: packagePureName, dir: path.resolve(env.appDir, '../doc')}];
            }
        });

        if (context.env === 'production') {
            webpackConfig.plugins.push(new LibExampleVersionPlugin());
        }

        return webpackConfig;
    }
};

module.exports = ReadmePlugin;
