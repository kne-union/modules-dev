const {parse} = require("@kne/md-doc");
const readmeGenerator = require('./readme-generator');
const readmeLoader = (source)=>{
    const target = parse(source);
    return readmeGenerator(target);
};

module.exports = readmeLoader;