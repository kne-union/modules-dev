const path = require("path");
const addReadmeLoader = require('./add-readme-loader');
const watchDocDir = require('./watch-doc-dir');


const {
    staticBaseUrl, moduleBaseDir, publicUrl, moduleAliasName
} = require("./env");
const componentsCssModules = require("./components-css-modules");

process.env.PUBLIC_URL = publicUrl;

const ReadmePlugin = {
    overrideDevServerConfig: ({devServerConfig}) => {
        devServerConfig = watchDocDir({devServerConfig}, {
            target: path.resolve(moduleBaseDir, "./*/doc/**/*"),
            name: path.relative(moduleBaseDir, dir).split(path.sep)[0],
            baseDir: path.resolve(moduleBaseDir, name)
        });
        return devServerConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig = componentsCssModules({webpackConfig, context});
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [moduleAliasName]: moduleBaseDir
        })
        webpackConfig = addReadmeLoader({webpackConfig, context});

        const definePlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "DefinePlugin");
        Object.assign(definePlugin.definitions["process.env"], {STATIC_BASE_URL: `"${staticBaseUrl}"`});
        return webpackConfig;
    }
};

module.exports = ReadmePlugin;
