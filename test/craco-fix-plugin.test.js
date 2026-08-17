const { expect } = require('chai');
const plugin = require('../lib/craco-fix-plugin');

const createConfig = (concatenateModules = true) => ({
  plugins: [],
  optimization: { concatenateModules },
  resolve: {}
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
