const merge = require("lodash/merge");
const last = require("lodash/last");
const get = require("lodash/get");
const {stringify} = require("@kne/md-doc");
const chokidar = require("chokidar");
const ReadmeWebpackPlugin = require('./readme-webpack-plugin');
const path = require("path");
const {loaderByName, getLoaders} = require("@craco/craco");
const loaderUtils = require("loader-utils");
const {
    moduleBaseDir, publicUrl, moduleAliasName, componentsName, componentsVersion
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
        const {hasFoundAny, matches} = getLoaders(webpackConfig, loaderByName("css-loader"));
        hasFoundAny && matches.forEach(({loader}) => {
            if (typeof get(loader.options, "modules.getLocalIdent") === "function") {
                const getLocalIdent = get(loader.options, "modules.getLocalIdent");
                loader.options = merge({}, loader.options, {
                    modules: {
                        getLocalIdent: (context, localIdentName, localName, options) => {
                            return getLocalIdent(context, localIdentName, localName, options) + "__" + loaderUtils.getHashDigest(`${componentsName}:${componentsVersion || '1.0.0'}`, "md5", "base64", 5);
                        }
                    }
                });
            }
        });

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