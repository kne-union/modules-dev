const CracoRemoteComponentsPlugin = require('./lib/craco-remote-components-plugin');
const CracoLibsExamplePlugin = require('./lib/craco-libs-example-plugin');
const moduleFederationConfig = require('./lib/modulefederation.config');
const env = require('./lib/env');

module.exports = {CracoRemoteComponentsPlugin, CracoLibsExamplePlugin, moduleFederationConfig, env};
