const {when} = require("@craco/craco");
const env = require("./env");
module.exports = {
    overrideWebpackConfig({webpackConfig, context}) {
        if (context.env === 'production') {
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