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
            "fs": false,
            // 支持 node: 协议的模块导入
            "node:diagnostics_channel": false,
            "node:http": false,
            "node:https": false,
            "node:stream": false,
            "node:buffer": false,
            "node:util": false,
            "node:url": false,
            "node:zlib": false,
            "node:path": false,
            "node:fs": false
        };
        return webpackConfig;
    }
};