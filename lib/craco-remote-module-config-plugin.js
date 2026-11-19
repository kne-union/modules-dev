const env = require('./env');

const REMOTE_MODULE_CONFIG_PATH = '/remote-module-config.json';

const getOrigin = req => {
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const protocol = forwardedProto || (req.socket && req.socket.encrypted ? 'https' : 'http');
    return `${protocol}://${req.headers.host}`;
};

/**
 * 与 @kne/npm-tools entryHtml 构建产出的 remote-module-config.json 同构：{ name, url, tpl, version }。
 * 构建产物只有 build 之后才有，本地 craco start 没有该文件，宿主（如应用中心）无法发现远程组件地址，这里由 dev server 实时给出。
 * url 为 remoteEntry.js 所在目录：PUBLIC_URL 是绝对地址时原样使用，否则以当前请求的 origin 补全。
 */
const buildRemoteModuleConfig = req => {
    const publicUrl = String(env.publicUrl || '/');
    const url = /^https?:\/\//i.test(publicUrl) ? publicUrl : `${getOrigin(req)}${publicUrl}`;
    return {
        name: env.componentsName,
        url: url.replace(/\/+$/, ''),
        tpl: '{{url}}',
        version: env.componentsVersion
    };
};

const remoteModuleConfigMiddleware = (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        return next();
    }
    // 宿主服务端与浏览器都可能读取，开发环境放开跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify(buildRemoteModuleConfig(req)));
};

const CracoRemoteModuleConfigPlugin = {
    overrideDevServerConfig: ({devServerConfig}) => {
        const originalSetupMiddlewares = devServerConfig.setupMiddlewares;
        devServerConfig.setupMiddlewares = (middlewares, devServer) => {
            const list = originalSetupMiddlewares ? originalSetupMiddlewares(middlewares, devServer) : middlewares;
            // 放在最前：SPA 的 historyApiFallback 会把未知路径回成 index.html
            list.unshift({name: 'remote-module-config', path: REMOTE_MODULE_CONFIG_PATH, middleware: remoteModuleConfigMiddleware});
            return list;
        };
        return devServerConfig;
    }
};

module.exports = CracoRemoteModuleConfigPlugin;
module.exports.buildRemoteModuleConfig = buildRemoteModuleConfig;
module.exports.REMOTE_MODULE_CONFIG_PATH = REMOTE_MODULE_CONFIG_PATH;
