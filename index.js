const CracoReadmePlugin = require('./lib/craco-readme-plugin');
const CracoReadmeLibPlugin = require('./lib/craco-readme-lib-plugin');
const moduleFederationConfig = require('./lib/modulefederation.config');
const env = require('./lib/env');

module.exports = {CracoReadmePlugin, CracoReadmeLibPlugin, moduleFederationConfig, env};
