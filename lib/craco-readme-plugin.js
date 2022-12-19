const merge = require("lodash/merge");
const ReadmeWebpackPlugin = require('./readme-webpack-plugin');

const ReadmePlugin = {
    overrideWebpackConfig({webpackConfig, context: {env}}) {
        webpackConfig.plugins.push(new ReadmeWebpackPlugin());
        webpackConfig.module.rules[1].oneOf.forEach((rule => {
            if (rule.options) {
                rule.options = merge({}, rule.options, {
                    comments: false
                });
            }
        }));
        return webpackConfig;
    }
};

module.exports = ReadmePlugin;