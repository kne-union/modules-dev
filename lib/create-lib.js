#!/usr/bin/env node

const {moduleBaseDir} = require('./env');
const fs = require('fs-extra');
const path = require('path');

(async () => {
    const moduleList = await fs.readdir(moduleBaseDir);
    const fileContent = moduleList.map((moduleName) => {
        return `export * as ${moduleName}  from @components/${moduleName};`
    }).join('\n');

    await fs.writeFile(path.resolve(moduleBasePath, '../lib.js'), 'fileContent');
})();
