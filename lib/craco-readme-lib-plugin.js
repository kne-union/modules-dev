const path = require('path');
const componentsCssModules = require('./components-css-modules');
const {
  appDir, publicUrl, moduleAliasName
} = require('./env');
const packageJson = require(path.resolve(appDir, '../package.json'));
const addReadmeLoader = require('./add-readme-loader');
const watchDocDir = require('./watch-doc-dir');
const packagePureName = packageJson.name.split('/')[1] || packageJson.name;

process.env.PUBLIC_URL = publicUrl;
process.env.BUILD_PATH = path.resolve(appDir, '../build');

const ReadmePlugin = {
  overrideDevServerConfig: ({ devServerConfig }) => {
    devServerConfig = watchDocDir({ devServerConfig }, {
      target: path.resolve(appDir, '../doc/**/*'), name: packagePureName, baseDir: path.resolve(appDir, '../')
    });

    return devServerConfig;
  }, overrideWebpackConfig({ webpackConfig, context }) {
    webpackConfig = componentsCssModules({ webpackConfig, context });
    webpackConfig.resolve.alias = Object.assign({}, webpackConfig.resolve.alias, {
      [`${moduleAliasName}/${packagePureName}/README.md`]: path.resolve(appDir, '../README.md')
    });
    webpackConfig = addReadmeLoader({ webpackConfig, context }, {
      getModuleList: () => {
        return [{ name: packagePureName, dir: path.resolve(appDir, '../doc') }];
      }
    });
    return webpackConfig;
  }
};

module.exports = ReadmePlugin;
