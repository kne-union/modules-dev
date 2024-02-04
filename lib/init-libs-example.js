#!/usr/bin/env node

const applyTemplate = require('@kne/apply-template');
const path = require('path');
const env = require('./env');
const spawn = require('cross-spawn-promise');

(async () => {
    const packageName = process.env.npm_package_name;
    const name = packageName.split('/')[1] || packageName;
    const exampleDir = path.resolve(env.appDir, 'example');
    await applyTemplate(env.templateLibsExampleDir, exampleDir, {
        name, packageName
    });
    console.log('完成示例程序初始化，开始安装依赖');
    await spawn('npm', ['i', '--legacy-peer-deps'], {
        cwd: exampleDir, stdio: 'inherit'
    });
    console.log('完成，拜拜👋');
})().catch((e) => {
    console.error(e);
});
