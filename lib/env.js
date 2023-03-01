const path = require('path');
const ensureSlash = require("@kne/ensure-slash");

const appDir = process.cwd();
const manifestPath = path.resolve(appDir, 'node_modules/readme/modules.js');

const staticBaseUrl = process.env.MODULES_DEV_STATIC_BASE_URL || '/ui_components';
const moduleBasePath = process.env.MODULES_DEV_BASE_PATH || "./src/components";
const moduleBaseDir = process.env.MODULES_DEV_BASE_DIR || path.resolve(appDir, moduleBasePath);
const moduleAliasName = process.env.MODULES_DEV_ALIAS_NAME || "@components";
const templateDir = process.env.MODULES_DEV_TEMPLATE_DIR || path.resolve(__dirname, '../template');
const componentsName = process.env.COMPONENTS_NAME || process.env.npm_package_name;
const componentsVersion = process.env.CURRENT_VERSION || process.env.npm_package_version;
const openComponentsVersion = (process.env.OPEN_CURRENT_VERSION || 'true') === 'true';

const publicUrl = `${ensureSlash(staticBaseUrl)}/${componentsName}${openComponentsVersion ? '/' + componentsVersion : ''}/`;

module.exports = {
    appDir,
    manifestPath,
    publicUrl,
    staticBaseUrl,
    moduleBaseDir,
    moduleBasePath,
    moduleAliasName,
    templateDir,
    componentsName,
    componentsVersion,
    openComponentsVersion
};