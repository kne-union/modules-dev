const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
module.exports = async (dir) => {
    const promptsConfigPath = path.resolve(dir, './prompts.json');
    const promptsConfig = [];
    const tempOptions = {};
    if (await fs.exists(promptsConfigPath)) {
        promptsConfig.push(...(await fs.readJson(promptsConfigPath)).filter(({name}) => ['name', 'description'].indexOf(name) === -1));
    }
    for (let current of promptsConfig) {
        const {name, type, options} = current;
        if (!name) {
            console.warn(`模板中的prompts必须设置name属性，程序将会忽略该项prompt参数获取，请自行检查是否会受此影响`);
            continue;
        }
        if (!inquirer[type]) {
            console.warn(`模板中的prompts类型[${type}]不被支持，程序将会忽略该项prompt参数获取，请自行检查是否会受此影响`);
            continue;
        }
        const prompts = inquirer[type];

        tempOptions[name] = await prompts(options);
    }

    return tempOptions;
};
