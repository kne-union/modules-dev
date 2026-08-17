const { expect } = require('chai');
const plugin = require('../lib/craco-fix-plugin');
const env = require('../lib/env');

const createConfig = (concatenateModules = true) => ({
  plugins: [],
  optimization: { concatenateModules },
  resolve: { alias: {}, plugins: [] }
});

describe('craco-fix-plugin concatenateModules', () => {
  it('production 应关闭 concatenateModules', () => {
    const webpackConfig = createConfig(true);
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'production' } });
    expect(webpackConfig.optimization.concatenateModules).to.equal(false);
  });

  it('development 不修改 concatenateModules', () => {
    const webpackConfig = createConfig(true);
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.optimization.concatenateModules).to.equal(true);
  });
});

describe('craco-fix-plugin readme alias', () => {
  it('应将 readme 别名到 .modules-dev/readme', () => {
    const webpackConfig = createConfig(true);
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.resolve.alias.readme).to.equal(env.readmeDir);
  });
});

