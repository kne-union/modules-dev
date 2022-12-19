const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '^/ui_components',
    createProxyMiddleware({
      target: 'http://ued.dev.fatalent.cn',
      changeOrigin: true
    })
  );
};
