const path = require("path");
const {dependencies} = require(path.resolve(process.cwd(), "./package.json"));
const fs = require("fs-extra");
const {manifestPath, moduleBaseDir, componentsName, componentsVersion, openComponentsVersion} = require('./env');

const list = fs.readdirSync(moduleBaseDir);

const components = {
    './components': manifestPath
};

list.forEach((name) => {
    components[`./${name}`] = path.resolve(moduleBaseDir, name);
});

const formatRemote = (remote) => {
    return remote.replace(/[-/.@]/g, '_');
};

module.exports = {
    name: formatRemote(`${componentsName}${openComponentsVersion ? `_${componentsVersion}` : ''}`),
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
        }, dayjs: {
            singleton: true, requiredVersion: false
        }, axios: {
            singleton: true, requiredVersion: false
        }, "@kne/react-fetch": {
            singleton: true, requiredVersion: false
        }, "@kne/react-form-antd": {
            singleton: true, requiredVersion: false
        }, "@kne/with-layer": {
            singleton: true, requiredVersion: false
        }, "@kne/remote-loader": {
            singleton: true, requiredVersion: false
        }, "@kne/use-event": {
            singleton: true, requiredVersion: false
        }, "@kne/global-context": {
            singleton: true, requiredVersion: false
        }
    }
};
