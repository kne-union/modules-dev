const path = require('path');
const { expect } = require('chai');
const env = require('../lib/env');

describe('env readme paths', () => {
  it('虚拟 readme 应落在 node_modules/.modules-dev 下', () => {
    expect(env.readmeDir).to.equal(path.resolve(process.cwd(), 'node_modules/.modules-dev/readme'));
    expect(env.readmeIndexPath).to.equal(path.resolve(env.readmeDir, 'index.js'));
    expect(env.manifestPath).to.equal(path.resolve(env.readmeDir, 'modules.js'));
    expect(env.modulesDevDir).to.equal(path.resolve(process.cwd(), 'node_modules/.modules-dev'));
  });
});
