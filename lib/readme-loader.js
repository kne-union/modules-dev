const { parse } = require('@kne/md-doc');
const readmeGenerator = require('./readme-generator');
const get = require('lodash/get');
const readmeLoader = function(source) {
  const options = this.getOptions();
  const target = parse(source);

  return readmeGenerator(Object.assign({}, target, options));
};

module.exports = readmeLoader;
