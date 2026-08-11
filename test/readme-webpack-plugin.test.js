const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { expect } = require('chai');
const { copyReadmeToOutput } = require('../lib/readme-webpack-plugin');

describe('copyReadmeToOutput', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'modules-dev-readme-copy-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('应将 README.md 拷贝到输出目录（与 remoteEntry 同级）', async () => {
    const readmePath = path.join(tempDir, 'README.md');
    const outputPath = path.join(tempDir, 'build');
    await fs.writeFile(readmePath, '# Package docs\n');

    const ok = await copyReadmeToOutput({ readmePath, outputPath });

    expect(ok).to.equal(true);
    expect(await fs.exists(path.join(outputPath, 'README.md'))).to.equal(true);
    expect(await fs.readFile(path.join(outputPath, 'README.md'), 'utf8')).to.equal('# Package docs\n');
  });

  it('源 README 不存在时返回 false 且不写文件', async () => {
    const outputPath = path.join(tempDir, 'build');
    const ok = await copyReadmeToOutput({
      readmePath: path.join(tempDir, 'missing.md'),
      outputPath
    });

    expect(ok).to.equal(false);
    expect(await fs.exists(path.join(outputPath, 'README.md'))).to.equal(false);
  });
});
