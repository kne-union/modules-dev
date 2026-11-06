const { expect } = require('chai');
const fs = require('fs');
const os = require('os');
const path = require('path');
const plugin = require('../lib/craco-react-compiler-plugin');
const remotePlugin = require('../lib/craco-remote-components-plugin');

const FAKE_PLUGIN = require.resolve('../lib/craco-fix-plugin');
const REPO_ROOT = path.resolve(__dirname, '..');
// 仓库之外的空目录，用来模拟「业务项目自己没有 react/compiler-runtime」
const NO_REACT_APP = path.join(os.tmpdir(), 'modules-dev-compiler-empty-app');
const HAS_REACT_19_RUNTIME = (() => {
  try {
    return Boolean(require.resolve('react/compiler-runtime', { paths: [REPO_ROOT] }));
  } catch (e) {
    return false;
  }
})();

const createWebpackConfig = () => ({
  module: {
    rules: [{
      oneOf: [
        {
          test: /\.(js|jsx)$/,
          include: '/project/src',
          loader: '/fake/babel-loader/lib/index.js',
          options: {
            presets: [['/fake/babel-preset-react-app/index.js', { runtime: 'automatic' }]],
            plugins: ['/fake/react-refresh/babel.js'],
            cacheIdentifier: 'production-base',
            cacheDirectory: true
          }
        },
        {
          test: /\.(js|mjs)$/,
          loader: '/fake/babel-loader/lib/index.js',
          options: {
            presets: [['/fake/babel-preset-react-app/dependencies.js', { helpers: true }]],
            cacheIdentifier: 'dependencies-base'
          }
        }
      ]
    }]
  }
});

const appLoader = (config) => config.module.rules[0].oneOf[0];
const depsLoader = (config) => config.module.rules[0].oneOf[1];
const findFederationPlugin = (cracoConfig) => cracoConfig.plugins.find(
  (item) => item.options && item.options.middleware !== undefined
);

describe('reactCompiler 开关解析', () => {
  it('默认关闭', () => {
    expect(plugin.getCompilerInput({}, {})).to.equal(false);
    expect(plugin.isEnabled(false)).to.equal(false);
  });

  it('支持插件 options 与 craco 顶层两种写法', () => {
    expect(plugin.getCompilerInput({ reactCompiler: true }, {})).to.equal(true);
    expect(plugin.getCompilerInput({}, { reactCompiler: { compilationMode: 'annotation' } }))
      .to.deep.equal({ compilationMode: 'annotation' });
  });

  it('插件 options 优先，显式 false 可覆盖顶层配置', () => {
    expect(plugin.getCompilerInput({ reactCompiler: false }, { reactCompiler: true })).to.equal(false);
  });
});

describe('reactCompiler 编译配置（React 18/19 统一）', () => {
  it('默认使用自带 runtime 的 target，无需按仓探测 React 版本', () => {
    const config = plugin.buildCompilerConfig(true);
    expect(config.target).to.equal('18');
    expect(config.compilerOptions.target).to.equal('18');
    expect(config.compilerOptions.panicThreshold).to.equal('none');
  });

  it('React 19 项目同样用默认 target，一个对象字段都不用加', () => {
    expect(plugin.buildCompilerConfig(true).target).to.equal(plugin.DEFAULT_TARGET);
  });

  it('允许显式切到 React 19 内置 runtime，并透传其它选项', () => {
    const config = plugin.buildCompilerConfig({ target: '19', compilationMode: 'annotation' });
    expect(config.compilerOptions.target).to.equal('19');
    expect(config.compilerOptions.compilationMode).to.equal('annotation');
  });

  it('target 非法时给出明确错误', () => {
    expect(() => plugin.buildCompilerConfig({ target: '16' })).to.throw('17 / 18 / 19');
  });
});

describe('reactCompiler 依赖内置（业务项目零安装）', () => {
  it('业务项目没装编译器时，从 modules-dev 自身依赖解析', () => {
    const resolved = plugin.resolveCompilerPlugin('babel-plugin-react-compiler', NO_REACT_APP);
    expect(resolved).to.match(/babel-plugin-react-compiler[\\/]dist[\\/]index\.js$/);
    expect(resolved.startsWith(REPO_ROOT)).to.equal(true);
  });

  it('runtime 解析目录指向 modules-dev 依赖所在的 node_modules', () => {
    const dir = plugin.resolveRuntimeModulesDir();
    expect(path.basename(dir)).to.equal('node_modules');
    expect(fs.existsSync(path.join(dir, 'react-compiler-runtime', 'package.json'))).to.equal(true);
  });

  it('业务项目残留旧版编译器时仍强制使用内置版本', () => {
    const fakeApp = fs.mkdtempSync(path.join(os.tmpdir(), 'md-compiler-'));
    const fakeDir = path.join(fakeApp, 'node_modules', 'babel-plugin-react-compiler');
    fs.mkdirSync(fakeDir, { recursive: true });
    fs.writeFileSync(path.join(fakeDir, 'package.json'), JSON.stringify({
      name: 'babel-plugin-react-compiler', version: '0.0.1', main: 'index.js'
    }));
    fs.writeFileSync(path.join(fakeDir, 'index.js'), 'module.exports = () => ({});');
    try {
      const resolved = plugin.resolveCompilerPlugin('babel-plugin-react-compiler', fakeApp);
      expect(resolved.startsWith(REPO_ROOT)).to.equal(true);
      expect(resolved).to.include(path.join('node_modules', 'babel-plugin-react-compiler'));
      expect(resolved).to.not.include(fakeApp);
    } finally {
      fs.rmSync(fakeApp, { recursive: true, force: true });
    }
  });

  it('显式 plugin 允许业务项目指定自己的编译器', () => {
    expect(plugin.resolveCompilerPlugin(FAKE_PLUGIN, NO_REACT_APP)).to.equal(FAKE_PLUGIN);
  });

  it('自定义插件缺失时不再要求业务项目装包', () => {
    expect(() => plugin.resolveCompilerPlugin('no-such-react-compiler-plugin', NO_REACT_APP))
      .to.throw('业务项目无需单独安装');
  });
});

describe('reactCompiler React 19 内置 runtime 校验', () => {
  it('React 19 项目允许显式 target 19', function () {
    if (!HAS_REACT_19_RUNTIME) { this.skip(); }
    expect(() => plugin.assertReact19Runtime('19', REPO_ROOT)).to.not.throw();
  });

  it('项目没有 react/compiler-runtime 时提示去掉 target（默认配置即可用）', () => {
    expect(() => plugin.assertReact19Runtime('19', NO_REACT_APP)).to.throw('去掉 target 配置');
  });

  it('默认 target 不做任何 react 子路径检查', () => {
    expect(() => plugin.assertReact19Runtime('18', NO_REACT_APP)).to.not.throw();
  });
});

describe('reactCompiler 模块联邦共享', () => {
  it('默认共享自带 runtime 单例', () => {
    expect(plugin.getCompilerSharedEntries('18')).to.deep.equal({
      'react-compiler-runtime': { singleton: true, requiredVersion: false }
    });
  });

  it('显式 target 19 时共享 react/compiler-runtime 单例', () => {
    expect(plugin.getCompilerSharedEntries('19')).to.deep.equal({
      'react/compiler-runtime': { singleton: true, requiredVersion: false }
    });
  });

  it('middleware 保留业务方配置并追加 shared', () => {
    const userMiddleware = (config) => Object.assign({}, config, { name: 'custom' });
    const middleware = plugin.createFederationMiddleware(userMiddleware, { target: '18' });
    const result = middleware({ name: 'origin', shared: { react: { singleton: true } } });
    expect(result.name).to.equal('custom');
    expect(result.shared.react).to.deep.equal({ singleton: true });
    expect(result.shared['react-compiler-runtime']).to.deep.equal({
      singleton: true, requiredVersion: false
    });
  });
});

describe('reactCompiler babel-loader 定位', () => {
  it('只匹配 app 源码规则，排除 dependencies 规则', () => {
    const config = createWebpackConfig();
    const found = plugin.findAppBabelLoaders(config);
    expect(found).to.have.length(1);
    expect(found[0]).to.equal(appLoader(config));
  });

  it('没有 app 规则时返回空数组', () => {
    const config = createWebpackConfig();
    config.module.rules[0].oneOf = [depsLoader(config)];
    expect(plugin.findAppBabelLoaders(config)).to.have.length(0);
  });
});

describe('reactCompiler webpack 注入', () => {
  it('默认关闭时完全不改动 webpack 配置', () => {
    const webpackConfig = createWebpackConfig();
    const before = JSON.stringify(webpackConfig);
    plugin.overrideWebpackConfig({ webpackConfig, pluginOptions: {}, cracoConfig: {} });
    expect(JSON.stringify(webpackConfig)).to.equal(before);
  });

  it('一个字段开启后编译器插件排在第一位，且不污染 node_modules 规则', () => {
    const webpackConfig = createWebpackConfig();
    plugin.overrideWebpackConfig({
      webpackConfig, pluginOptions: { reactCompiler: true }, cracoConfig: {}
    });
    expect(appLoader(webpackConfig).options.plugins[0][0])
      .to.match(/babel-plugin-react-compiler[\\/]dist[\\/]index\.js$/);
    expect(appLoader(webpackConfig).options.plugins[0][1].target).to.equal('18');
    expect(appLoader(webpackConfig).options.plugins[1]).to.equal('/fake/react-refresh/babel.js');
    expect(depsLoader(webpackConfig).options.plugins).to.equal(undefined);
    expect(depsLoader(webpackConfig).options.cacheIdentifier).to.equal('dependencies-base');
  });

  it('自动把自带 runtime 的 node_modules 追加到 resolve.modules 末尾', () => {
    const webpackConfig = createWebpackConfig();
    webpackConfig.resolve = { modules: ['node_modules', '/project/node_modules'], alias: { foo: 'bar' } };
    plugin.overrideWebpackConfig({
      webpackConfig, pluginOptions: { reactCompiler: true }, cracoConfig: {}
    });
    const modules = webpackConfig.resolve.modules;
    expect(modules.slice(0, 2)).to.deep.equal(['node_modules', '/project/node_modules']);
    expect(modules[2]).to.equal(plugin.resolveRuntimeModulesDir());
    expect(webpackConfig.resolve.alias).to.deep.equal({ foo: 'bar' });
  });

  it('显式 target 19 时不注入 runtime 目录', function () {
    if (!HAS_REACT_19_RUNTIME) { this.skip(); }
    const webpackConfig = createWebpackConfig();
    plugin.overrideWebpackConfig({
      webpackConfig, pluginOptions: { reactCompiler: { target: '19' } }, cracoConfig: {}
    });
    expect(webpackConfig.resolve).to.equal(undefined);
  });

  it('cacheIdentifier 绑定编译配置', () => {
    const webpackConfig = createWebpackConfig();
    plugin.overrideWebpackConfig({
      webpackConfig, pluginOptions: { reactCompiler: true }, cracoConfig: {}
    });
    expect(appLoader(webpackConfig).options.cacheIdentifier)
      .to.match(/^production-base\|react-compiler-[a-f0-9]{12}$/);
  });

  it('重复 override 不重复注入，也不重复追加缓存标识与 resolve.modules', () => {
    const webpackConfig = createWebpackConfig();
    const args = { webpackConfig, pluginOptions: { reactCompiler: true }, cracoConfig: {} };
    plugin.overrideWebpackConfig(args);
    const cacheIdentifier = appLoader(webpackConfig).options.cacheIdentifier;
    const modulesLength = webpackConfig.resolve.modules.length;
    plugin.overrideWebpackConfig(args);
    expect(appLoader(webpackConfig).options.plugins).to.have.length(2);
    expect(appLoader(webpackConfig).options.cacheIdentifier).to.equal(cacheIdentifier);
    expect(webpackConfig.resolve.modules).to.have.length(modulesLength);
  });

  it('编译配置变化时 cacheIdentifier 随之变化', () => {
    const first = createWebpackConfig();
    const second = createWebpackConfig();
    plugin.overrideWebpackConfig({ webpackConfig: first, pluginOptions: { reactCompiler: true }, cracoConfig: {} });
    plugin.overrideWebpackConfig({
      webpackConfig: second,
      pluginOptions: { reactCompiler: { compilationMode: 'annotation' } },
      cracoConfig: {}
    });
    expect(appLoader(second).options.cacheIdentifier).to.not.equal(appLoader(first).options.cacheIdentifier);
  });

  it('找不到 app babel-loader 时报错而不是静默跳过', () => {
    const webpackConfig = createWebpackConfig();
    webpackConfig.module.rules[0].oneOf = [depsLoader(webpackConfig)];
    expect(() => plugin.overrideWebpackConfig({
      webpackConfig, pluginOptions: { reactCompiler: true }, cracoConfig: {}
    })).to.throw('没找到 CRA 应用源码的 babel-loader');
  });
});

describe('CracoRemoteComponentsPlugin reactCompiler 开关', () => {
  const userMiddleware = (config) => config;

  it('默认关闭：不挂载编译器插件，middleware 原样传递', () => {
    const cracoConfig = { plugins: [] };
    remotePlugin.overrideCracoConfig({ cracoConfig, pluginOptions: { middleware: userMiddleware } });
    expect(cracoConfig.plugins.some((item) => item.plugin === plugin)).to.equal(false);
    expect(findFederationPlugin(cracoConfig).options.middleware).to.equal(userMiddleware);
  });

  it('仅一个字段开启：挂载编译器插件并给 MF 追加自带 runtime 单例', () => {
    const cracoConfig = { plugins: [] };
    remotePlugin.overrideCracoConfig({
      cracoConfig, pluginOptions: { middleware: userMiddleware, reactCompiler: true }
    });
    const compilerEntry = cracoConfig.plugins.find((item) => item.plugin === plugin);
    expect(compilerEntry).to.exist;
    expect(compilerEntry.options.reactCompiler).to.equal(true);
    const middleware = findFederationPlugin(cracoConfig).options.middleware;
    const shared = middleware({ shared: { react: { singleton: true } } }).shared;
    expect(shared.react).to.deep.equal({ singleton: true });
    expect(shared['react-compiler-runtime']).to.deep.equal({ singleton: true, requiredVersion: false });
  });

  it('顶层配置同样只用一个字段', () => {
    const cracoConfig = { plugins: [], reactCompiler: true };
    remotePlugin.overrideCracoConfig({ cracoConfig, pluginOptions: {} });
    expect(cracoConfig.plugins.some((item) => item.plugin === plugin)).to.equal(true);
  });
});
