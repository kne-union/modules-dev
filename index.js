const CracoRemoteComponentsPlugin = require('./lib/craco-remote-components-plugin');
const CracoLibsExamplePlugin = require('./lib/craco-libs-example-plugin');
const CracoIsolateCopiedWebpackCachePlugin = require('./lib/craco-isolate-copied-webpack-cache-plugin');
const env = require('./lib/env');
const buildComponentDocs = require('./lib/build-component-docs');

module.exports = {
  CracoRemoteComponentsPlugin,
  CracoLibsExamplePlugin,
  CracoIsolateCopiedWebpackCachePlugin,
  env,
  buildComponentDocs
};

