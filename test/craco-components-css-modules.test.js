const { expect } = require('chai');
const loaderUtils = require('loader-utils');
const plugin = require('../lib/craco-components-css-modules');
const env = require('../lib/env');

const { toSafeIdent, appendVersionedLocalIdent, overrideWebpackConfig } = plugin;

const versionHash = (name, version) =>
  loaderUtils.getHashDigest(`${name}:${version || '1.0.0'}`, 'md5', 'base64', 5);

// 预先选定的、5 位 md5-base64 版本哈希含特殊字符的夹具（与 getHashDigest 算法绑定）
const NAME = 'components-core';
const VERSION_PLUS_SLASH = '0.42'; // o+/pj
const VERSION_SAFE = '0.7.4'; // uQvZP

const createWebpackConfig = (getLocalIdent) => ({
  module: {
    rules: [{
      oneOf: [{
        test: /\.css$/,
        use: [{
          // loaderByName 匹配路径中的 /css-loader/，用假路径避免把 css-loader 引入本包依赖
          loader: '/fake/node_modules/css-loader/dist/cjs.js',
          options: getLocalIdent === undefined ? {} : {
            modules: { getLocalIdent }
          }
        }]
      }]
    }]
  }
});

const wrappedIdent = (webpackConfig) =>
  webpackConfig.module.rules[0].oneOf[0].use[0].options.modules.getLocalIdent;

describe('toSafeIdent', () => {
  it('将 + / 分别换成 - _，并去掉 =', () => {
    expect(toSafeIdent('ab+c/d==')).to.equal('ab-c_d');
  });

  it('普通字母数字类名保持不变', () => {
    expect(toSafeIdent('style_container__EM0we__uQvZP')).to.equal('style_container__EM0we__uQvZP');
  });

  it('连字符本地名中的 - 不被改写', () => {
    expect(toSafeIdent('style_is-mobile__EM0we__uQvZP')).to.equal('style_is-mobile__EM0we__uQvZP');
    expect(toSafeIdent('style_show-bg__OcL+R__uQvZP')).to.equal('style_show-bg__OcL-R__uQvZP');
  });

  it('对完整最终类名同时覆盖内部哈希与版本哈希中的 + / =', () => {
    // k+uRt 是 CRA 内部哈希；a/bC= 模拟版本哈希中的 / 与 =
    expect(toSafeIdent('style_container__k+uRt__a/bC=')).to.equal('style_container__k-uRt__a_bC');
  });

  it('非标准本地名若含 + / = 也会被同样替换（边界）', () => {
    expect(toSafeIdent('style_foo+bar__xx/yy=__v')).to.equal('style_foo-bar__xx_yy__v');
  });
});

describe('appendVersionedLocalIdent', () => {
  it('在内层 ident 后追加版本哈希，再对整串做安全编码', () => {
    expect(versionHash(NAME, VERSION_PLUS_SLASH)).to.equal('o+/pj');
    expect(appendVersionedLocalIdent('style_container__k+uRt', NAME, VERSION_PLUS_SLASH))
      .to.equal('style_container__k-uRt__o-_pj');
  });

  it('只改版本哈希不够：内部哈希的 + 必须一并处理', () => {
    const inner = 'style_container__k+uRt';
    const ver = versionHash(NAME, VERSION_SAFE);
    expect(ver).to.equal('uQvZP');
    // 若只清洗后缀，k+uRt 仍在
    expect(`${inner}__${ver}`).to.equal('style_container__k+uRt__uQvZP');
    expect(appendVersionedLocalIdent(inner, NAME, VERSION_SAFE))
      .to.equal('style_container__k-uRt__uQvZP');
  });

  it('版本哈希含 / 时也会被编码', () => {
    expect(versionHash(NAME, '0.9')).to.equal('Ii/LV');
    expect(appendVersionedLocalIdent('style_title__abcde', NAME, '0.9'))
      .to.equal('style_title__abcde__Ii_LV');
  });

  it('连字符本地名保持，导出所用本地名不受影响（本函数只处理生成类名）', () => {
    expect(appendVersionedLocalIdent('style_is-mobile__EM0we', NAME, VERSION_SAFE))
      .to.equal('style_is-mobile__EM0we__uQvZP');
  });
});

describe('craco-components-css-modules overrideWebpackConfig', () => {
  const prevName = process.env.COMPONENTS_NAME;
  const prevVersion = process.env.CURRENT_VERSION;

  beforeEach(() => {
    process.env.COMPONENTS_NAME = NAME;
    process.env.CURRENT_VERSION = VERSION_PLUS_SLASH;
  });

  afterEach(() => {
    if (prevName === undefined) delete process.env.COMPONENTS_NAME;
    else process.env.COMPONENTS_NAME = prevName;
    if (prevVersion === undefined) delete process.env.CURRENT_VERSION;
    else process.env.CURRENT_VERSION = prevVersion;
  });

  it('包装后的 getLocalIdent 对完整类名编码，且调用时本地名原样传入', () => {
    const seen = [];
    const inner = (context, localIdentName, localName) => {
      seen.push(localName);
      const hashes = { container: 'k+uRt', 'is-mobile': 'EM0we', 'show-bg': 'OcL+R' };
      return `style_${localName}__${hashes[localName] || 'ab+c/'}`;
    };
    const webpackConfig = createWebpackConfig(inner);
    overrideWebpackConfig({ webpackConfig });
    const getLocalIdent = wrappedIdent(webpackConfig);

    expect(getLocalIdent({}, '[local]', 'container')).to.equal('style_container__k-uRt__o-_pj');
    expect(getLocalIdent({}, '[local]', 'is-mobile')).to.equal('style_is-mobile__EM0we__o-_pj');
    expect(getLocalIdent({}, '[local]', 'show-bg')).to.equal('style_show-bg__OcL-R__o-_pj');
    // 导出 key 对应的本地名原样传给内层，包装器不改写 localName
    expect(seen).to.deep.equal(['container', 'is-mobile', 'show-bg']);
    expect(env.componentsName).to.equal(NAME);
    expect(env.componentsVersion).to.equal(VERSION_PLUS_SLASH);
  });

  it('没有 getLocalIdent 函数时不改写 loader options', () => {
    const webpackConfig = createWebpackConfig(undefined);
    const before = JSON.stringify(webpackConfig.module);
    overrideWebpackConfig({ webpackConfig });
    expect(JSON.stringify(webpackConfig.module)).to.equal(before);
  });
});
