#!/usr/bin/env node

const inquirer = require('inquirer');
const camelCase = require('@kne/camel-case');
const applyTemplate = require('@kne/apply-template');
const path = require('path');
const env = require('./env');
const fs = require('fs-extra');

(async () => {
    const output = await inquirer.prompt([{
        type: 'input', name: 'name', message: "请输入模块名称",
    }, {
        type: 'input', name: 'summary', message: '请输入模块用途'
    }]);
    const name = camelCase(output.name), outputDir = path.resolve(env.moduleBaseDir, name);
    const tempOptions = {
        name, summary: output.summary, moduleAliasName: env.moduleAliasName
    };
    await applyTemplate(env.templateDir, outputDir, tempOptions);
    if (await fs.exists(path.resolve(env.appDir, 'template'))) {
        console.log('当前项目存在自定义模板，执行自定义模板覆盖');
        await applyTemplate(env.templateDir, outputDir, tempOptions);
    }
    console.log('完成，请开始模块开发，拜拜👋');
})().catch((e) => {
    console.error(e);
});
