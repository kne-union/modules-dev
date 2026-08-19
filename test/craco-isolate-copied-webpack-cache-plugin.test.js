const path = require('path');
const { expect } = require('chai');
const plugin = require('../lib/craco-isolate-copied-webpack-cache-plugin');
const env = require('../lib/env');

const { getIsolateCopiedWebpackCacheName } = plugin;

describe('craco-isolate-copied-webpack-cache-plugin', () => {
  const createConfig = () => ({
    cache: { type: 'filesystem', cacheDirectory: '/tmp/shared-cache', version: 'hash' }
  });

  it('应将 webpack cache 指到项目 .cache/webpack，并用 appDir 生成 name/version', () => {
    const webpackConfig = createConfig();
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.cache.cacheDirectory).to.equal(path.resolve(env.appDir, '.cache/webpack'));
    expect(webpackConfig.cache.name).to.equal(getIsolateCopiedWebpackCacheName(env.appDir));
    expect(webpackConfig.cache.version).to.equal(`hash|${env.appDir}`);
  });

  it('不同 appDir 应得到不同 cache.name', () => {
    const a = getIsolateCopiedWebpackCacheName('/Users/me/.cursor_workplace/app/a');
    const b = getIsolateCopiedWebpackCacheName('/Users/me/Documents/Github/app');
    expect(a).to.not.equal(b);
  });

  it('没有 filesystem cache 时不抛错', () => {
    const webpackConfig = {};
    plugin.overrideWebpackConfig({ webpackConfig, context: { env: 'development' } });
    expect(webpackConfig.cache).to.equal(undefined);
  });
});

describe('default plugins include isolateCopiedWebpackCache', () => {
  const fs = require('fs');
  const remoteSrc = fs.readFileSync(path.join(__dirname, '../lib/craco-remote-components-plugin.js'), 'utf8');
  const libsSrc = fs.readFileSync(path.join(__dirname, '../lib/craco-libs-example-plugin.js'), 'utf8');

  it('CracoRemoteComponentsPlugin 应默认加入该插件', () => {
    expect(remoteSrc).to.include("require('./craco-isolate-copied-webpack-cache-plugin')");
  });

  it('CracoLibsExamplePlugin 应默认加入该插件', () => {
    expect(libsSrc).to.include("require('./craco-isolate-copied-webpack-cache-plugin')");
  });
});
