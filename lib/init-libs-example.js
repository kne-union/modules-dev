#!/usr/bin/env node

const applyTemplate = require('@kne/apply-template');
const path = require('path');
const env = require('./env');
const fs = require('fs-extra');
const spawn = require('cross-spawn-promise');
const {program} = require('commander');
const downloadNpmPackage = require('@kne/fetch-npm-package');
const readPrompts = require('./readPrompts');
const camelCase = require('@kne/camel-case');
const lodash = require('lodash');

program.option('--template <name-to-template>', 'specify a template for the created project');
program.parse();
const options = program.opts();

const resolveLocalTemplateDir = (templatePackageName) => {
    try {
        const packageJsonPath = require.resolve(`${templatePackageName}/package.json`);
        return path.resolve(path.dirname(packageJsonPath), 'template');
    } catch (e) {
        return null;
    }
};

const downloadTemplateWithRetry = async (templatePackageName, callback, {retries = 3, delay = 1000} = {}) => {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await downloadNpmPackage(templatePackageName, null, {callback});
            return;
        } catch (err) {
            lastError = err;
            if (attempt < retries) {
                console.warn(`下载模板 ${templatePackageName} 失败 (第 ${attempt}/${retries} 次): ${err.message}，${delay * attempt}ms 后重试...`);
                await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                continue;
            }
        }
    }
    throw lastError;
};

const applyExampleTemplate = async (templateDir, exampleDir, tempOptions) => {
    const promptsDir = path.resolve(templateDir, '..');
    await applyTemplate(
        templateDir,
        exampleDir,
        Object.assign({}, await readPrompts(promptsDir), tempOptions)
    );
};

(async () => {
    const packageName = process.env.npm_package_name;
    const name = packageName.split('/')[1] || packageName;
    const exampleDir = path.resolve(env.appDir, 'example');
    const tempOptions = {
        name,
        packageName,
        templateLibs: {
            camelCase,
            lodash
        }
    };

    if (env.templateLibsExampleDir) {
        await applyTemplate(env.templateLibsExampleDir, exampleDir, tempOptions);
    } else {
        const templatePackageName = options.template || '@kne-template/example';
        const localTemplateDir = resolveLocalTemplateDir(templatePackageName);
        if (localTemplateDir && await fs.pathExists(localTemplateDir)) {
            console.log(`使用本地已安装的模板: ${templatePackageName}`);
            await applyExampleTemplate(localTemplateDir, exampleDir, tempOptions);
        } else {
            await downloadTemplateWithRetry(templatePackageName, async (dir) => {
                await applyExampleTemplate(path.resolve(dir, './template'), exampleDir, tempOptions);
            });
        }
    }

    if (await fs.exists(path.resolve(env.appDir, 'template-libs-example'))) {
        console.log('当前项目存在自定义模板，执行自定义模板覆盖');
        await applyTemplate(path.resolve(env.appDir, 'template-libs-example'), exampleDir, tempOptions);
    }
    console.log('完成示例程序初始化，开始安装依赖');
    await spawn('npm', ['i'], {
        cwd: exampleDir,
        stdio: 'inherit'
    });
    console.log('完成，拜拜👋');
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
