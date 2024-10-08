const path = require('path');
const ensureSlash = require('@kne/ensure-slash');
const template = require('lodash/template');

const appDir = process.cwd();
const manifestPath = path.resolve(appDir, 'node_modules/readme/modules.js');

const env = {
    appDir, manifestPath
};

Object.defineProperties(env, {
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
            return process.env.MODULES_DEV_PUBLIC_URL_TEMPLATE = '{{staticBaseUrl}}/{{componentsName}}{{openComponentsVersion?"/"+componentsVersion:""}}';
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
