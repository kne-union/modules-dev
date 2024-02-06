const {getLoaders, loaderByName} = require("@craco/craco");
const get = require("lodash/get");
const merge = require("lodash/merge");
const loaderUtils = require("loader-utils");
const {componentsName, componentsVersion} = require("./env");

module.exports = {
    overrideWebpackConfig: ({webpackConfig}) => {
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

        return webpackConfig;
    }
};
