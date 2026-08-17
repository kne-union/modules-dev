const fs = require('fs');
const path = require('path');
const ensureSlash = require('@kne/ensure-slash');
const template = require('lodash/template');

const appDir = process.cwd();
// 虚拟 readme 不能放在 node_modules 下：workplace 软链 node_modules 时 webpack
// 会 realpath 到 SOURCE，找不到虚拟文件。
const modulesDevDir = path.resolve(appDir, '.modules-dev');
const readmeDir = path.resolve(modulesDevDir, 'readme');
const manifestPath = path.resolve(readmeDir, 'modules.js');
const readmeIndexPath = path.resolve(readmeDir, 'index.js');

const env = {
    appDir, modulesDevDir, readmeDir, manifestPath, readmeIndexPath
};

Object.defineProperties(env, {
    isNodeModulesSymlink: {
        get() {
            try {
                return fs.lstatSync(path.resolve(this.appDir, 'node_modules')).isSymbolicLink();
            } catch (e) {
                return false;
            }
        }
    },
    staticBaseUrl: {
        get() {
            return ensureSlash(process.env.MODULES_DEV_STATIC_BASE_URL || '/ui_components');
        }
    }, moduleBasePath: {
        get() {
            return ensureSlash(process.env.MODULES_DEV_BASE_PATH || './src/components');
        }
    }, moduleBaseDir: {
        get() {
            return process.env.MODULES_DEV_BASE_DIR || path.resolve(this.appDir, this.moduleBasePath);
        }
    }, moduleAliasName: {
        get() {
            return process.env.MODULES_DEV_ALIAS_NAME || '@components';
        }
    }, templateDir: {
        get() {
            return process.env.MODULES_DEV_TEMPLATE_DIR;
        }
    }, templateLibsExampleDir: {
        get() {
            return process.env.MODULES_DEV_TEMPLATE_DIR;
        }
    }, componentsName: {
        get() {
            return process.env.COMPONENTS_NAME || process.env.npm_package_name;
        }
    }, openComponentsVersion: {
        get() {
            return (process.env.OPEN_CURRENT_VERSION || 'true') === 'true';
        }
    }, publicUrlTemplate: {
        get() {
            return process.env.MODULES_DEV_PUBLIC_URL_TEMPLATE || '{{staticBaseUrl}}/{{componentsName}}{{openComponentsVersion?"/"+componentsVersion:""}}';
        }
    }, componentsVersion: {
        get() {
            return process.env.CURRENT_VERSION || process.env.npm_package_version;
        }
    }, publicUrl: {
        get() {
            return process.env.MODULES_DEV_PUBLIC_URL || template(this.publicUrlTemplate, {interpolate: /{{([\s\S]+?)}}/g})({
                staticBaseUrl: this.staticBaseUrl,
                componentsName: this.componentsName,
                openComponentsVersion: this.openComponentsVersion,
                componentsVersion: this.componentsVersion
            });
        }
    }
});

module.exports = env;
