const {CracoLibsExamplePlugin} = require('@kne/modules-dev');
const aliasConfig = require('./webstorm.webpack.config');

module.exports = {
    webpack: {
        alias: aliasConfig.resolve.alias, configure: (webpackConfig) => {
            const definePlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === 'DefinePlugin');
            Object.assign(definePlugin.definitions['process.env'], {});
            return webpackConfig;
        }
    }, plugins: [{
        plugin: CracoLibsExamplePlugin
    }]
};
