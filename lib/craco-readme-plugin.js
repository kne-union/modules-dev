const {getLoader} = require("@craco/craco");
const merge = require("lodash/merge");
const ReadmeWebpackPlugin = require("./readme-webpack-plugin");
const chokidar = require("chokidar");
const {stringify} = require("@kne/md-doc");

const ReadmePlugin = {
    overrideWebpackConfig: ({webpackConfig, context, pluginOptions}) => {
        const {loaderOptions, getModuleList} = Object.assign({}, pluginOptions);
        webpackConfig.module.rules.push({
            test: /README\.md$/, loader: require.resolve('./readme-loader'), options: loaderOptions
        });

        (() => {
            const {isFound, match} = getLoader(webpackConfig, (loader) => {
                return loader.type === 'asset/resource';
            });

            if (!isFound) {
                return;
            }

            if (!match.loader.exclude) {
                match.loader.exclude = [];
            }

            match.loader.exclude.push(/README\.md$/);
        })();

        (() => {
            const {isFound, match} = getLoader(webpackConfig, (loader) => {
                return Array.isArray(loader.oneOf);
            });

            if (!isFound) {
                return;
            }
            match.loader.oneOf.forEach((rule => {
                if (rule.options) {
                    rule.options = merge({}, rule.options, {
                        comments: false
                    });
                }
            }));
        })();

        webpackConfig.plugins.push(new ReadmeWebpackPlugin({
            env: context.env, getModuleList
        }));

        return webpackConfig;
    }, overrideDevServerConfig: ({devServerConfig, pluginOptions}) => {
        const {watchTarget, watchCallback} = Object.assign({}, pluginOptions);
        const onBeforeSetupMiddleware = devServerConfig.onBeforeSetupMiddleware;
        devServerConfig.onBeforeSetupMiddleware = (...args) => {
            chokidar.watch(watchTarget).on("all", async (event, dir) => {
                const props = watchCallback({event, dir});
                if (!props.name) {
                    return;
                }
                try {
                    await stringify(props)
                } catch (e) {
                    console.error(e);
                }
            });
            onBeforeSetupMiddleware && onBeforeSetupMiddleware(...args);
        };
        return devServerConfig;
    }
};

module.exports = ReadmePlugin;
