const path = require('path');
const env = require('./env');

const getIsolateCopiedWebpackCacheName = (appDir = env.appDir) => `dev-${String(appDir).replace(/[^a-zA-Z0-9]+/g, '_')}`;

// workplace rsync 会拷走原仓 .cache；webpack pack 记绝对路径。
// 仅改 cacheDirectory 不够：name 仍是 default-development 时会复用原仓 pack，去编原仓 src。
const isolateCopiedWebpackCache = (webpackConfig, appDir = env.appDir) => {
    if (!webpackConfig.cache || typeof webpackConfig.cache !== 'object') {
        return;
    }
    webpackConfig.cache.cacheDirectory = path.join(appDir, '.cache', 'webpack');
    webpackConfig.cache.name = getIsolateCopiedWebpackCacheName(appDir);
    webpackConfig.cache.version = `${webpackConfig.cache.version || ''}|${appDir}`;
};

module.exports = {
    overrideWebpackConfig({webpackConfig}) {
        isolateCopiedWebpackCache(webpackConfig);
        return webpackConfig;
    }
};

module.exports.isolateCopiedWebpackCache = isolateCopiedWebpackCache;
module.exports.getIsolateCopiedWebpackCacheName = getIsolateCopiedWebpackCacheName;
