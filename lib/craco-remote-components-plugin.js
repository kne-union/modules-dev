const path = require("path");
const env = require("./env");
const {formatRemote} = require('./utils');
const {
    getCompilerInput, isEnabled, buildCompilerConfig, createFederationMiddleware
} = require('./craco-react-compiler-plugin');

module.exports = {
    overrideCracoConfig: ({cracoConfig, pluginOptions}) => {
        process.env.PUBLIC_URL = env.publicUrl;
        // React Compiler 默认关闭，只有显式配置 reactCompiler 才注入编译插件与 runtime 单例。
        // 编译器与 runtime 由本包内置，业务项目零额外安装、无需区分 React 18/19。
        const compilerInput = getCompilerInput(pluginOptions, cracoConfig);
        const compilerEnabled = isEnabled(compilerInput);
        const compilerConfig = compilerEnabled ? buildCompilerConfig(compilerInput) : null;
        const middleware = compilerEnabled
            ? createFederationMiddleware(pluginOptions?.middleware, compilerConfig)
            : pluginOptions?.middleware;
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
                middleware
            }
        }, {
            plugin: require('./craco-fix-plugin'), options: {}
        }, {
            plugin: require('./craco-isolate-copied-webpack-cache-plugin'), options: {}
        });
        if (compilerEnabled) {
            cracoConfig.plugins.push({
                plugin: require('./craco-react-compiler-plugin'),
                options: {reactCompiler: compilerInput}
            });
        }
        return cracoConfig;
    }, overrideWebpackConfig({webpackConfig, context}) {
        const remoteName = formatRemote(`${env.componentsName}${env.openComponentsVersion ? `_${env.componentsVersion}` : ''}`);
        webpackConfig.output = Object.assign({}, webpackConfig.output, {
            uniqueName: remoteName,
            chunkLoadingGlobal: `webpackChunk_${remoteName}`,
            hotUpdateGlobal: `webpackHotUpdate_${remoteName}`
        });
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [env.moduleAliasName]: env.moduleBaseDir
        })
        const definePlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "DefinePlugin");
        Object.assign(definePlugin.definitions["process.env"], {STATIC_BASE_URL: `"${env.staticBaseUrl}"`});
        return webpackConfig;
    }
};
