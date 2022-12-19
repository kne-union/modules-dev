const CracoModuleFederation = require('craco-module-federation');
const ReadmePlugin = require("./lib/craco-readme-plugin");
const path = require('path');

module.exports = {
    webpack: {
        alias: {
            "@modules": path.resolve("./src/modules")
        }
    }, plugins: [{
        plugin: ReadmePlugin
    }, {
        plugin: CracoModuleFederation
    }]
};
