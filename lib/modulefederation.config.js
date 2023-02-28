const path = require("path");
const {dependencies} = require(path.resolve(process.cwd(), "./package.json"));
const fs = require("fs-extra");
const {moduleBaseDir, componentsName, componentsVersion} = require('./env');

const components = {};

const list = fs.readdirSync(moduleBaseDir);

list.forEach((name) => {
    components[`./${name}`] = path.resolve(moduleBaseDir, name);
});

module.exports = {
    name: `${componentsName.replace(/-/g, "_")}_${componentsVersion.replace(/\./g, "_")}`,
    exposes: components,
    filename: "remoteEntry.js",
    shared: {
        ...dependencies, react: {
            singleton: true, requiredVersion: false
        }, "react-dom": {
            singleton: true, requiredVersion: false
        }, "react-router-dom": {
            singleton: true, requiredVersion: false
        }, antd: {
            singleton: true, requiredVersion: false
        }, axios: {
            singleton: true, requiredVersion: false
        }, "@kne/react-fetch": {
            singleton: true, requiredVersion: false
        }, "@kne/react-form-antd": {
            singleton: true, requiredVersion: false
        }, "@kne/with-layer": {
            singleton: true, requiredVersion: false
        }
    }
};
