const path = require("path");
const addReadmeLoader = require('./add-readme-loader');
const watchDocDir = require('./watch-doc-dir');
const {
    staticBaseUrl, moduleBaseDir, publicUrl, moduleAliasName
} = require("./env");
const componentsCssModules = require("./components-css-modules");

const ReadmePlugin = {
    overrideCracoConfig:({cracoConfig})=>{
        process.env.PUBLIC_URL = publicUrl;
        return cracoConfig;
    },
    overrideDevServerConfig: ({devServerConfig}) => {
        devServerConfig = watchDocDir({devServerConfig}, {
            target: path.resolve(moduleBaseDir, "./*/doc/**/*"), callback: ({dir}) => {
                const name = path.relative(moduleBaseDir, dir).split(path.sep)[0];
                return {
                    name, baseDir: path.resolve(moduleBaseDir, name)
                }
            }
        });
        return devServerConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        webpackConfig = componentsCssModules({webpackConfig, context});
        if(context.env==='production'){
            webpackConfig.optimization.runtimeChunk = true;
        }
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
