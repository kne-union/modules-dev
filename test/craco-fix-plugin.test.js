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

describe('craco-fix-plugin ESM node_modules', () => {
  it('应为 node_modules 的 .mjs 加上 javascript/auto 且 fullySpecified: false', () => {
    const webpackConfig = createConfig(true);
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'production' } });
    const rule = webpackConfig.module.rules.find(
      (item) => item && item.type === 'javascript/auto' && String(item.test) === String(/\.mjs$/)
    );
    expect(rule).to.exist;
    expect(rule.include).to.deep.equal(/node_modules/);
    expect(rule.resolve).to.deep.equal({ fullySpecified: false });
  });

  it('重复 override 不应重复添加 .mjs 规则', () => {
    const webpackConfig = createConfig(true);
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'production' } });
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'production' } });
    const rules = webpackConfig.module.rules.filter(
      (item) => item && item.type === 'javascript/auto' && String(item.test) === String(/\.mjs$/)
    );
    expect(rules).to.have.length(1);
  });

  it('resolve.conditionNames 应优先 import/module', () => {
    const webpackConfig = createConfig(true);
    webpackConfig.resolve.conditionNames = ['require', 'browser'];
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'production' } });
    expect(webpackConfig.resolve.conditionNames).to.deep.equal(['import', 'module', '...']);
  });

  it('已是 import/module/... 时不改写 conditionNames', () => {
    const webpackConfig = createConfig(true);
    const preferred = ['import', 'module', '...'];
    webpackConfig.resolve.conditionNames = preferred;
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'production' } });
    expect(webpackConfig.resolve.conditionNames).to.equal(preferred);
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
    const babelRule = webpackConfig.module.rules.find((item) => item && item.oneOf);
    expect(babelRule.oneOf[0].options.cacheDirectory).to.equal(
      path.resolve(env.appDir, '.cache/babel-loader')
    );
  });
});

