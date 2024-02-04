#!/usr/bin/env node

const applyTemplate = require('@kne/apply-template');
const path = require('path');
const env = require('./env');
const fs = require('fs-extra');
const spawn = require('cross-spawn-promise');

(async () => {
    const packageName = process.env.npm_package_name;
    const name = packageName.split('/')[1] || packageName;
    const exampleDir = path.resolve(env.appDir, 'example');
    const tempOptions = {
        name, packageName
    };
    await applyTemplate(env.templateLibsExampleDir, exampleDir, {
        name, packageName
    });
    if (await fs.exists(path.resolve(env.appDir, 'template-libs-example'))) {
        console.log('当前项目存在自定义模板，执行自定义模板覆盖');
        await applyTemplate(path.resolve(env.appDir, 'template-libs-example'), exampleDir, tempOptions);
    }
    console.log('完成示例程序初始化，开始安装依赖');
    await spawn('npm', ['i', '--legacy-peer-deps'], {
        cwd: exampleDir, stdio: 'inherit'
    });
    console.log('完成，拜拜👋');
})().catch((e) => {
    console.error(e);
});
