const {getLoaders, loaderByName} = require("@kne/craco");
const get = require("lodash/get");
const merge = require("lodash/merge");
const loaderUtils = require("loader-utils");
const env = require("./env");

// 将完整最终类名中的 base64 特殊字符换成 CSS 标识符安全字符。
// 必须作用于「内层 getLocalIdent + 版本哈希」拼完后的整串：只清洗版本后缀
// 无法去掉 CRA 内部哈希里的 `+`（例如 k+uRt），会在 postcss-selector-parser@7.2.0
// 上被再次转义成 `\\\+`，CSS 选择器与 JS 导出名对不上。
// `+`→`-`、`/`→`_` 对标准 base64 字母表（A-Za-z0-9+/）是一一映射；`=` 为 padding，
// CRA 默认 5 位哈希前缀通常不会出现。本地名中已有的 `-`（如 is-mobile）不会被改写。
function toSafeIdent(ident) {
    return String(ident).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function appendVersionedLocalIdent(innerIdent, name, version) {
    const ident = String(innerIdent) + "__" + loaderUtils.getHashDigest(`${name}:${version || "1.0.0"}`, "md5", "base64", 5);
    return toSafeIdent(ident);
}

module.exports = {
    toSafeIdent,
    appendVersionedLocalIdent,
    overrideWebpackConfig: ({webpackConfig}) => {
        const {hasFoundAny, matches} = getLoaders(webpackConfig, loaderByName("css-loader"));
        hasFoundAny && matches.forEach(({loader}) => {
            if (typeof get(loader.options, "modules.getLocalIdent") === "function") {
                const getLocalIdent = get(loader.options, "modules.getLocalIdent");
                loader.options = merge({}, loader.options, {
                    modules: {
                        getLocalIdent: (context, localIdentName, localName, options) => {
                            return appendVersionedLocalIdent(getLocalIdent(context, localIdentName, localName, options), env.componentsName, env.componentsVersion);
                        }
                    }
                });
            }
        });

        return webpackConfig;
    }
};
