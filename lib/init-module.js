const inquirer = require('inquirer');
const camelCase = require('@kne/camel-case');
const applyTemplate = require('@kne/apply-template');
const path = require('path');

(async () => {
    const output = await inquirer.prompt([{
        type: 'input', name: 'name', message: "请输入模块名称",
    }, {
        type: 'input', name: 'summary', message: '请输入模块用途'
    }]);
    const name = camelCase(output.name);
    await applyTemplate(path.resolve(__dirname, '../template'), path.resolve(process.cwd(), 'src/modules', name), {
        name, summary: output.summary
    });
    console.log('完成，请开始模块开发，拜拜👋');
})().catch((e) => {
    console.error(e);
});
