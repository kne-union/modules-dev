const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { expect } = require('chai');
const buildComponentDocs = require('../lib/build-component-docs');
const { DOC_MD_START, DOC_MD_END, toPascalName } = buildComponentDocs;

describe('toPascalName', () => {
  it('应将 kebab 转为大驼峰', () => {
    expect(toPascalName('button-group')).to.equal('ButtonGroup');
    expect(toPascalName('FormInfo')).to.equal('FormInfo');
  });
});

describe('buildComponentDocs', () => {
  let tempDir;

  const createComponent = async (componentsDir, name, { summary, description } = {}) => {
    const base = path.join(componentsDir, name);
    await fs.ensureDir(path.join(base, 'doc'));
    await fs.writeFile(path.join(base, 'index.js'), 'module.exports = {};\n');
    await fs.writeJson(path.join(base, 'package.json'), {
      name: `@test/${String(name).toLowerCase()}`,
      description: description || `${name} desc`,
      version: '1.0.0'
    });
    await fs.writeFile(path.join(base, 'doc/summary.md'), summary || `${name} summary`);
    await fs.writeFile(path.join(base, 'doc/api.md'), `${name} api`);
    await fs.writeJson(path.join(base, 'doc/example.json'), { list: [] });
  };

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'modules-dev-build-docs-'));
    const componentsDir = path.join(tempDir, 'src/components');

    await createComponent(componentsDir, 'Beta');
    await createComponent(componentsDir, 'Alpha');
    await createComponent(componentsDir, 'button-group', {
      summary: 'Button group summary text',
      description: 'fallback desc'
    });

    // 旧的非大驼峰残留，应被清理
    await fs.ensureDir(path.join(tempDir, 'docs'));
    await fs.writeFile(path.join(tempDir, 'docs', 'button-group.md'), 'stale\n');

    await fs.writeFile(
      path.join(tempDir, 'README.md'),
      `# Root\n\nintro\n\n${DOC_MD_START}\n\nold\n\n${DOC_MD_END}\n`
    );
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('应生成 docs/{PascalName}.md 且根 README DOC_MD 仅为目录表', async () => {
    const moduleBaseDir = path.join(tempDir, 'src/components');
    const rootReadme = path.join(tempDir, 'README.md');
    const docsDir = path.join(tempDir, 'docs');

    const result = await buildComponentDocs({ moduleBaseDir, rootReadme, docsDir });

    expect(result.list.map((item) => item.name)).to.deep.equal(['Alpha', 'Beta', 'button-group']);
    expect(await fs.exists(path.join(moduleBaseDir, 'Alpha/README.md'))).to.equal(true);
    expect(await fs.exists(path.join(docsDir, 'Alpha.md'))).to.equal(true);
    expect(await fs.exists(path.join(docsDir, 'Beta.md'))).to.equal(true);
    expect(await fs.exists(path.join(docsDir, 'ButtonGroup.md'))).to.equal(true);
    expect(await fs.exists(path.join(docsDir, 'button-group.md'))).to.equal(false);

    const alphaDocs = await fs.readFile(path.join(docsDir, 'Alpha.md'), 'utf8');
    const buttonGroupDocs = await fs.readFile(path.join(docsDir, 'ButtonGroup.md'), 'utf8');
    expect(alphaDocs).to.include('Alpha');
    expect(buttonGroupDocs.length).to.be.greaterThan(20);

    const root = await fs.readFile(rootReadme, 'utf8');
    expect(root).to.include('# Root');
    expect(root).to.include('intro');
    expect(root).to.include(DOC_MD_START);
    expect(root).to.include(DOC_MD_END);
    expect(root).to.not.include('\nold\n');
    expect(root).to.include('[Alpha](docs/Alpha.md)');
    expect(root).to.include('[ButtonGroup](docs/ButtonGroup.md)');
    expect(root).to.include('Button group summary text');
    // 不应再嵌入组件全文
    expect(root).to.not.include(alphaDocs.trim());

    const start = root.indexOf(DOC_MD_START);
    const end = root.indexOf(DOC_MD_END);
    const section = root.slice(start + DOC_MD_START.length, end);
    expect(section.indexOf('Alpha')).to.be.lessThan(section.indexOf('Beta'));
    expect(section.indexOf('Beta')).to.be.lessThan(section.indexOf('ButtonGroup'));

    // fullReadme：完整聚合，与根 README 无关
    expect(result.fullReadme).to.include(DOC_MD_START);
    expect(result.fullReadme).to.include(DOC_MD_END);
    expect(result.fullReadme).to.include(alphaDocs.trim());
    expect(result.fullReadme).to.include(buttonGroupDocs.trim());
    expect(result.fullReadme.indexOf(alphaDocs.trim())).to.be.lessThan(
      result.fullReadme.indexOf(buttonGroupDocs.trim())
    );
    expect(root).to.not.equal(result.fullReadme);
  });
});
