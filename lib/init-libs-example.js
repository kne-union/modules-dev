#!/usr/bin/env node

const applyTemplate = require('@kne/apply-template');
const path = require('path');
const env = require('./env');
const fs = require('fs-extra');
const spawn = require('cross-spawn-promise');
const {program} = require('commander');
const downloadNpmPackage = require('@kne/fetch-npm-package');
const readPrompts = require("./readPrompts");
const camelCase = require("@kne/camel-case");
const lodash = require("lodash");

program.option('--template <name-to-template>', 'specify a template for the created project');
program.parse();
const options = program.opts();

(async () => {
    const packageName = process.env.npm_package_name;
    const name = packageName.split('/')[1] || packageName;
    const exampleDir = path.resolve(env.appDir, 'example');
    const tempOptions = {
        name, packageName, templateLibs: {
            camelCase, lodash
        }
    };

    if (env.templateLibsExampleDir) {
        await applyTemplate(env.templateLibsExampleDir, exampleDir, tempOptions);
    } else {
        const templatePackageName = options.template || '@kne-template/example';
        await downloadNpmPackage(templatePackageName, null, {
            callback: async (dir) => {
                await applyTemplate(path.resolve(dir, './template'), exampleDir, Object.assign({}, await readPrompts(dir), tempOptions));
            }
        });
    }

    if (await fs.exists(path.resolve(env.appDir, 'template-libs-example'))) {
        console.log('当前项目存在自定义模板，执行自定义模板覆盖');
        await applyTemplate(path.resolve(env.appDir, 'template-libs-example'), exampleDir, tempOptions);
    }
    console.log('完成示例程序初始化，开始安装依赖');
    await spawn('npm', ['i'], {
        cwd: exampleDir, stdio: 'inherit'
    });
    console.log('完成，拜拜👋');
})().catch((e) => {
    console.error(e);
});
