const fs = require('fs-extra');
const path = require('path');

const getModuleList = async (moduleBaseDir) => {
  const output = [];
  const list = await fs.readdir(moduleBaseDir);
  for (let name of list) {
    const docDir = path.resolve(moduleBaseDir, name, 'doc');
    if (await fs.exists(docDir) && (await fs.exists(path.resolve(moduleBaseDir, name, 'index.js')))) {
      output.push({ name, dir: docDir });
    }
  }
  return output;
};

const formatRemote = (remote) => {
  return remote.replace(/[-/.@]/g, '_');
};

module.exports = { getModuleList, formatRemote };
