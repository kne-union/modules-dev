const path = require('path');
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
  it('应将 readme 别名到 node_modules/.modules-dev/readme', () => {
    const webpackConfig = createConfig(true);
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.resolve.alias.readme).to.equal(env.readmeDir);
  });

  it('应把 readme 目录加入 ModuleScopePlugin allowedPaths', () => {
    const webpackConfig = createConfig(true);
    webpackConfig.resolve.plugins = [{
      constructor: { name: 'ModuleScopePlugin' },
      allowedFiles: new Set(),
      allowedPaths: []
    }];
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.resolve.plugins[0].allowedPaths).to.include(env.readmeDir);
  });
});

describe('craco-fix-plugin app cache isolation', () => {
  it('应将 webpack filesystem cache 指到项目 .cache/webpack', () => {
    const webpackConfig = createConfig(true);
    webpackConfig.cache = { type: 'filesystem', cacheDirectory: '/tmp/shared-cache' };
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.cache.cacheDirectory).to.equal(path.resolve(env.appDir, '.cache/webpack'));
  });

  it('应将 babel-loader cacheDirectory 指到项目 .cache/babel-loader', () => {
    const webpackConfig = createConfig(true);
    webpackConfig.module = {
      rules: [
        {
          oneOf: [
            {
              loader: '/fake/babel-loader/lib/index.js',
              options: { cacheDirectory: true }
            }
          ]
        }
      ]
    };
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.module.rules[0].oneOf[0].options.cacheDirectory).to.equal(
      path.resolve(env.appDir, '.cache/babel-loader')
    );
  });
});

