const path = require('path');
const { expect } = require('chai');
const env = require('../lib/env');

describe('env readme paths', () => {
  it('虚拟 readme 应落在 .modules-dev 下而不是 node_modules', () => {
    expect(env.readmeDir).to.equal(path.resolve(process.cwd(), '.modules-dev/readme'));
    expect(env.readmeIndexPath).to.equal(path.resolve(env.readmeDir, 'index.js'));
    expect(env.manifestPath).to.equal(path.resolve(env.readmeDir, 'modules.js'));
    expect(env.manifestPath.includes(`${path.sep}node_modules${path.sep}`)).to.equal(false);
    expect(env.readmeIndexPath.includes(`${path.sep}node_modules${path.sep}`)).to.equal(false);
  });
});
