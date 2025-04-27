const path = require('path');
const {dependencies} = require(path.resolve(process.cwd(), './package.json'));
const fs = require('fs-extra');
const env = require('./env');
const {formatRemote} = require('./utils');

let components = {};

if (fs.existsSync(env.moduleBaseDir)) {
    components = {
        './components': env.manifestPath
    };
}

if (fs.existsSync(env.moduleBaseDir)) {
    const list = fs.readdirSync(env.moduleBaseDir);
    list.forEach((name) => {
        components[`./${name}`] = path.resolve(env.moduleBaseDir, name);
    });
}

module.exports = {
    name: formatRemote(`${env.componentsName}${env.openComponentsVersion ? `_${env.componentsVersion}` : ''}`),
    exposes: components,
    filename: 'remoteEntry.js',
    shared: {
        ...dependencies, react: {
            singleton: true, requiredVersion: false
        }, 'react-dom': {
            singleton: true, requiredVersion: false
        }, 'react-router-dom': {
            singleton: true, requiredVersion: false
        }, antd: {
            singleton: true, requiredVersion: false
        }, dayjs: {
            singleton: true, requiredVersion: false
        }, axios: {
            singleton: true, requiredVersion: false
        }, '@kne/react-fetch': {
            singleton: true, requiredVersion: false
        }, '@kne/react-form-antd': {
            singleton: true, requiredVersion: false
        }, '@kne/remote-loader': {
            singleton: true, requiredVersion: false
        }, '@kne/react-intl': {
            singleton: true, requiredVersion: false
        }, '@kne/use-event': {
            singleton: true, requiredVersion: false
        }, '@kne/global-context': {
            singleton: true, requiredVersion: false
        }, '@kne/global-preset': {
            singleton: true, requiredVersion: false
        }
    }
};
