const {when} = require("@kne/craco");
const env = require("./env");
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
        return webpackConfig;
    }
};
