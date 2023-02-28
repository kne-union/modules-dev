const path = require('path');

const moduleBasePath = process.env.MODULES_DEV_BASE_PATH || "./src/components";
const moduleBaseDir = process.env.MODULES_DEV_BASE_DIR || path.resolve(process.cwd(), moduleBasePath);
const moduleAliasName = process.env.MODULES_DEV_ALIAS_NAME || "@components";
const templateDir = process.env.MODULES_DEV_TEMPLATE_DIR || path.resolve(__dirname, '../template');

const componentsName = process.env.COMPONENTS_NAME || process.env.npm_package_name;
const componentsVersion = process.env.CURRENT_VERSION || process.env.npm_package_version;

module.exports = {moduleBaseDir, moduleBasePath, moduleAliasName, templateDir, componentsName, componentsVersion};