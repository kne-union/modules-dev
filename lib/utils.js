const fs = require("fs-extra");
const path = require("path");

const getModuleList = async (moduleBaseDir) => {
    const output = [];
    const list = await fs.readdir(moduleBaseDir);
    for (let name of list) {
        if (await fs.exists(path.resolve(moduleBaseDir, name, "doc")) && (await fs.exists(path.resolve(moduleBaseDir, name, "index.js")))) {
            output.push(name);
        }
    }
    return output;
};

module.exports = {getModuleList};