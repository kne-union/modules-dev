const { getLoader } = require('@craco/craco');
const merge = require('lodash/merge');
const ReadmeWebpackPlugin = require('./readme-webpack-plugin');
const path = require('path');
const { appDir } = require('./env');
const addReadmeLoader = ({ webpackConfig, context: { env } }, { getModuleList }) => {
  webpackConfig.module.rules.push({
    test: /README\.md$/, loader: require.resolve('./readme-loader')
  });

  (() => {
    const { isFound, match } = getLoader(webpackConfig, (loader) => {
      return loader.type === 'asset/resource';
    });

    if (!isFound) {
      return;
    }

    if (!match.loader.exclude) {
      match.loader.exclude = [];
    }

    match.loader.exclude.push(/README\.md$/);
  })();

  (() => {
    const { isFound, match } = getLoader(webpackConfig, (loader) => {
      return Array.isArray(loader.oneOf);
    });

    if (!isFound) {
      return;
    }
    match.loader.oneOf.forEach((rule => {
      if (rule.options) {
        rule.options = merge({}, rule.options, {
          comments: false
        });
      }
    }));
  })();

  webpackConfig.plugins.push(new ReadmeWebpackPlugin({
    env, getModuleList
  }));

  return webpackConfig;
};

module.exports = addReadmeLoader;
