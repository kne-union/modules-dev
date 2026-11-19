const { expect } = require('chai');
const plugin = require('../lib/craco-remote-module-config-plugin');
const remoteComponentsPlugin = require('../lib/craco-remote-components-plugin');

const ENV_KEYS = ['COMPONENTS_NAME', 'CURRENT_VERSION', 'MODULES_DEV_PUBLIC_URL', 'OPEN_CURRENT_VERSION'];

const createReq = (overrides = {}) => ({
  method: 'GET',
  headers: { host: 'localhost:3041' },
  socket: {},
  ...overrides
});

const createRes = () => {
  const res = {
    statusCode: 0,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
      this.ended = true;
    }
  };
  return res;
};

const getMiddleware = () => {
  const devServerConfig = {};
  plugin.overrideDevServerConfig({ devServerConfig });
  const list = devServerConfig.setupMiddlewares([], {});
  return list[0];
};

describe('craco-remote-module-config-plugin：dev server 提供 /remote-module-config.json', () => {
  const saved = {};

  beforeEach(() => {
    ENV_KEYS.forEach(key => {
      saved[key] = process.env[key];
      delete process.env[key];
    });
    process.env.COMPONENTS_NAME = 'on-boarding';
    process.env.CURRENT_VERSION = '0.1.19';
    process.env.MODULES_DEV_PUBLIC_URL = '/';
  });

  afterEach(() => {
    ENV_KEYS.forEach(key => {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    });
  });

  it('返回与 entryHtml 产物同构的 { name, url, tpl, version }，url 取自当前请求的 origin', () => {
    const res = createRes();
    getMiddleware().middleware(createReq(), res, () => {});
    expect(res.statusCode).to.equal(200);
    expect(res.headers['content-type']).to.contain('application/json');
    expect(res.headers['access-control-allow-origin']).to.equal('*');
    expect(JSON.parse(res.body)).to.deep.equal({ name: 'on-boarding', url: 'http://localhost:3041', tpl: '{{url}}', version: '0.1.19' });
  });

  it('PUBLIC_URL 是路径时拼在 origin 后；是绝对地址时原样使用；末尾斜杠去掉', () => {
    process.env.MODULES_DEV_PUBLIC_URL = '/ui_components/on-boarding/0.1.19/';
    expect(plugin.buildRemoteModuleConfig(createReq()).url).to.equal('http://localhost:3041/ui_components/on-boarding/0.1.19');
    process.env.MODULES_DEV_PUBLIC_URL = 'https://dev.example.com/app/';
    expect(plugin.buildRemoteModuleConfig(createReq()).url).to.equal('https://dev.example.com/app');
  });

  it('经反向代理或 https 访问时协议跟随 x-forwarded-proto / socket.encrypted', () => {
    expect(plugin.buildRemoteModuleConfig(createReq({ headers: { host: 'a.com', 'x-forwarded-proto': 'https' } })).url).to.equal('https://a.com');
    expect(plugin.buildRemoteModuleConfig(createReq({ headers: { host: 'a.com' }, socket: { encrypted: true } })).url).to.equal('https://a.com');
  });

  it('版本取 CURRENT_VERSION（与联邦容器名使用的版本一致）', () => {
    process.env.CURRENT_VERSION = '2.0.1';
    expect(plugin.buildRemoteModuleConfig(createReq()).version).to.equal('2.0.1');
  });

  it('只处理 GET / HEAD / OPTIONS；其它方法交给后续中间件', () => {
    const { middleware } = getMiddleware();
    let nextCalled = false;
    const post = createRes();
    middleware(createReq({ method: 'POST' }), post, () => (nextCalled = true));
    expect(nextCalled).to.equal(true);
    expect(post.ended).to.equal(false);

    const options = createRes();
    middleware(createReq({ method: 'OPTIONS' }), options, () => {});
    expect(options.statusCode).to.equal(204);

    const head = createRes();
    middleware(createReq({ method: 'HEAD' }), head, () => {});
    expect(head.statusCode).to.equal(200);
    expect(head.body).to.equal(undefined);
  });

  it('放在中间件链最前，并保留原有 setupMiddlewares 的结果', () => {
    const original = [{ name: 'history-fallback' }];
    const devServerConfig = {
      setupMiddlewares: (middlewares, devServer) => {
        expect(devServer).to.deep.equal({ id: 1 });
        return [...middlewares, ...original];
      }
    };
    plugin.overrideDevServerConfig({ devServerConfig });
    const list = devServerConfig.setupMiddlewares([], { id: 1 });
    expect(list.map(item => item.name)).to.deep.equal(['remote-module-config', 'history-fallback']);
    expect(list[0].path).to.equal('/remote-module-config.json');
  });

  it('CracoRemoteComponentsPlugin 已注册该插件', () => {
    const cracoConfig = { plugins: [] };
    remoteComponentsPlugin.overrideCracoConfig({ cracoConfig, pluginOptions: {} });
    expect(cracoConfig.plugins.some(item => item.plugin === plugin)).to.equal(true);
  });
});
