const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { expect } = require('chai');
const buildComponentDocs = require('../lib/build-component-docs');
const { DOC_MD_START, DOC_MD_END } = buildComponentDocs;

describe('buildComponentDocs', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'modules-dev-build-docs-'));
    const componentsDir = path.join(tempDir, 'src/components');

    for (const name of ['Beta', 'Alpha']) {
      const base = path.join(componentsDir, name);
      await fs.ensureDir(path.join(base, 'doc'));
      await fs.writeFile(path.join(base, 'index.js'), 'module.exports = {};\n');
      await fs.writeJson(path.join(base, 'package.json'), {
        name: `@test/${name.toLowerCase()}`,
        description: `${name} desc`,
        version: '1.0.0'
      });
      await fs.writeFile(path.join(base, 'doc/summary.md'), `${name} summary`);
      await fs.writeFile(path.join(base, 'doc/api.md'), `${name} api`);
      await fs.writeJson(path.join(base, 'doc/example.json'), { list: [] });
    }

    await fs.writeFile(
      path.join(tempDir, 'README.md'),
      `# Root\n\nintro\n\n${DOC_MD_START}\n\nold\n\n${DOC_MD_END}\n`
    );
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('应生成各组件 README 并替换根 README 的 DOC_MD', async () => {
    const moduleBaseDir = path.join(tempDir, 'src/components');
    const rootReadme = path.join(tempDir, 'README.md');

    const result = await buildComponentDocs({ moduleBaseDir, rootReadme });

    expect(result.list.map(item => item.name)).to.deep.equal(['Alpha', 'Beta']);
    expect(await fs.exists(path.join(moduleBaseDir, 'Alpha/README.md'))).to.equal(true);
    expect(await fs.exists(path.join(moduleBaseDir, 'Beta/README.md'))).to.equal(true);

    const alphaReadme = await fs.readFile(path.join(moduleBaseDir, 'Alpha/README.md'), 'utf8');
    const betaReadme = await fs.readFile(path.join(moduleBaseDir, 'Beta/README.md'), 'utf8');
    const root = await fs.readFile(rootReadme, 'utf8');

    expect(root).to.include('# Root');
    expect(root).to.include('intro');
    expect(root).to.include(DOC_MD_START);
    expect(root).to.include(DOC_MD_END);
    expect(root).to.not.include('\nold\n');
    expect(root).to.include(alphaReadme.trim());
    expect(root).to.include(betaReadme.trim());

    const start = root.indexOf(DOC_MD_START);
    const end = root.indexOf(DOC_MD_END);
    const section = root.slice(start + DOC_MD_START.length, end);
    expect(section.indexOf('Alpha')).to.be.lessThan(section.indexOf('Beta'));
  });
});
