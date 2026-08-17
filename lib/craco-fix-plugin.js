const {when} = require("@kne/craco");
const env = require("./env");

// alias 到绝对路径时，即便落在 node_modules 下，ModuleScopePlugin 仍按 src 外拦截
const allowReadmeOutsideSrc = (webpackConfig) => {
    const plugins = webpackConfig.resolve && webpackConfig.resolve.plugins;
    if (!Array.isArray(plugins)) {
        return;
    }
    const scopePlugin = plugins.find((plugin) => plugin && plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin');
    if (!scopePlugin) {
        return;
    }
    if (scopePlugin.allowedFiles && typeof scopePlugin.allowedFiles.add === 'function') {
        scopePlugin.allowedFiles.add(env.readmeIndexPath);
        scopePlugin.allowedFiles.add(env.manifestPath);
    }
    if (Array.isArray(scopePlugin.allowedPaths) && !scopePlugin.allowedPaths.includes(env.readmeDir)) {
        scopePlugin.allowedPaths.push(env.readmeDir);
    }
};

module.exports = {
    overrideWebpackConfig({webpackConfig, context}) {
        if (context.env === 'production') {
            // 关闭 scope hoisting：MF shared + ESM babel helpers/locale 被拼进同一作用域会 TDZ
            webpackConfig.optimization = Object.assign({}, webpackConfig.optimization, {
                concatenateModules: false
            });
            when(context.env === 'production', () => {
                // 查找 MiniCssExtractPlugin 实例
                const miniCssExtractPlugin = webpackConfig.plugins.find(plugin => plugin.constructor && plugin.constructor.name === 'MiniCssExtractPlugin');

                if (miniCssExtractPlugin) {
                    // 修改配置
                    miniCssExtractPlugin.options.ignoreOrder = true;
                }
            });
        }
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            readme: env.readmeDir
        });
        webpackConfig.resolve.fallback = {
            "path": false,
            "util": false,
            "url": false,
            "http": false,
            "https": false,
            "stream": false,
            "assert": false,
            "querystring": false,
            "zlib": false,
            "fs": false
        };
        allowReadmeOutsideSrc(webpackConfig);
        return webpackConfig;
    }
};
