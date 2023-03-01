const merge = require("lodash/merge");
const last = require("lodash/last");
const {stringify} = require("@kne/md-doc");
const chokidar = require("chokidar");
const ReadmeWebpackPlugin = require('./readme-webpack-plugin');
const path = require("path");
const {
    moduleBaseDir, publicUrl, moduleAliasName
} = require("./env");

process.env.PUBLIC_URL = publicUrl;

const ReadmePlugin = {
    overrideDevServerConfig: ({devServerConfig}) => {
        const onBeforeSetupMiddleware = devServerConfig.onBeforeSetupMiddleware;
        devServerConfig.onBeforeSetupMiddleware = (...args) => {
            chokidar.watch(path.resolve(moduleBaseDir, "./*/doc/**/*")).on("all", async (event, dir) => {
                const name = path.relative(moduleBaseDir, dir).split(path.sep)[0];
                if (!name) {
                    return;
                }
                try {
                    await stringify({baseDir: path.resolve(moduleBaseDir, name), name})
                } catch (e) {
                    console.error(e);
                }
            });
            onBeforeSetupMiddleware && onBeforeSetupMiddleware(...args);
        };

        return devServerConfig;
    }, overrideWebpackConfig({webpackConfig, context: {env}}) {
        webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
            [moduleAliasName]: moduleBaseDir
        })
        webpackConfig.module.rules.push({
            test: /README\.md$/, loader: require.resolve('./readme-loader')
        });
        last(webpackConfig.module.rules[1].oneOf).exclude.push(/README\.md$/);
        webpackConfig.plugins.push(new ReadmeWebpackPlugin({env}));
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