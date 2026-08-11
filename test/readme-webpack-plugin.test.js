const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { expect } = require('chai');
const { writeFullReadmeToOutput } = require('../lib/readme-webpack-plugin');

describe('writeFullReadmeToOutput', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'modules-dev-readme-write-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('应将完整文档写入输出目录 README.md', async () => {
    const outputPath = path.join(tempDir, 'build');
    const content = '<!--START_SECTION:DOC_MD-->\n\n# FormInfo\n\nfull\n\n<!--END_SECTION:DOC_MD-->\n';

    const ok = await writeFullReadmeToOutput({ content, outputPath });

    expect(ok).to.equal(true);
    expect(await fs.exists(path.join(outputPath, 'README.md'))).to.equal(true);
    expect(await fs.readFile(path.join(outputPath, 'README.md'), 'utf8')).to.equal(content);
  });

  it('内容为空时返回 false 且不写文件', async () => {
    const outputPath = path.join(tempDir, 'build');
    expect(await writeFullReadmeToOutput({ content: '', outputPath })).to.equal(false);
    expect(await writeFullReadmeToOutput({ content: null, outputPath })).to.equal(false);
    expect(await fs.exists(path.join(outputPath, 'README.md'))).to.equal(false);
  });
});
