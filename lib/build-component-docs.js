#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const { stringify } = require('@kne/md-doc');
const env = require('./env');
const { getModuleList } = require('./utils');

const DOC_MD_START = '<!--START_SECTION:DOC_MD-->';
const DOC_MD_END = '<!--END_SECTION:DOC_MD-->';

const upsertDocMdSection = async (rootReadmePath, body) => {
  const section = `${DOC_MD_START}\n\n${body}\n\n${DOC_MD_END}`;
  const exists = await fs.exists(rootReadmePath);

  if (!exists) {
    await fs.writeFile(rootReadmePath, `${section}\n`);
    return;
  }

  const content = await fs.readFile(rootReadmePath, 'utf8');
  const start = content.indexOf(DOC_MD_START);
  const end = content.indexOf(DOC_MD_END);

  if (start !== -1 && end !== -1 && end > start) {
    const next = `${content.slice(0, start)}${section}${content.slice(end + DOC_MD_END.length)}`;
    await fs.writeFile(rootReadmePath, next);
    return;
  }

  const trimmed = content.replace(/\s*$/, '');
  await fs.writeFile(rootReadmePath, `${trimmed}\n\n${section}\n`);
};

/**
 * 生成各组件 README.md，并聚合写入根 README 的 DOC_MD 段。
 * @param {object} [options]
 * @param {string} [options.moduleBaseDir]
 * @param {string} [options.rootReadme]
 * @param {Function} [options.getModuleList]
 */
const buildComponentDocs = async (options = {}) => {
  const moduleBaseDir = options.moduleBaseDir || env.moduleBaseDir;
  const rootReadme = options.rootReadme || path.resolve(env.appDir, 'README.md');
  const listLoader = options.getModuleList || getModuleList;
  const list = await listLoader(moduleBaseDir);

  await Promise.all(list.map(props => stringify(props)));

  const sorted = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const parts = [];
  for (const { baseDir } of sorted) {
    const readmePath = path.join(baseDir, 'README.md');
    if (await fs.exists(readmePath)) {
      parts.push((await fs.readFile(readmePath, 'utf8')).trim());
    }
  }

  await upsertDocMdSection(rootReadme, parts.join('\n\n'));

  return { list: sorted, rootReadme };
};

module.exports = buildComponentDocs;
module.exports.upsertDocMdSection = upsertDocMdSection;
module.exports.DOC_MD_START = DOC_MD_START;
module.exports.DOC_MD_END = DOC_MD_END;

if (require.main === module) {
  buildComponentDocs().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
