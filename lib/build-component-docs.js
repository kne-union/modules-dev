#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const { stringify } = require('@kne/md-doc');
const camelCase = require('@kne/camel-case');
const env = require('./env');
const { getModuleList } = require('./utils');

const DOC_MD_START = '<!--START_SECTION:DOC_MD-->';
const DOC_MD_END = '<!--END_SECTION:DOC_MD-->';
const SUMMARY_MAX_LEN = 120;

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

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncateSummary = (text) => {
  const s = stripHtml(text);
  if (s.length <= SUMMARY_MAX_LEN) {
    return s;
  }
  return `${s.slice(0, SUMMARY_MAX_LEN).replace(/\s+\S*$/, '')}…`;
};

const escapeTableCell = (text) =>
  String(text || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();

/**
 * 简介：doc/summary.md → package.json.description
 */
const resolveComponentSummary = async (baseDir) => {
  const summaryPath = path.join(baseDir, 'doc/summary.md');
  if (await fs.exists(summaryPath)) {
    const raw = await fs.readFile(summaryPath, 'utf8');
    const summary = truncateSummary(raw);
    if (summary) {
      return summary;
    }
  }
  try {
    const pkg = await fs.readJson(path.join(baseDir, 'package.json'));
    return truncateSummary(pkg.description || '');
  } catch {
    return '';
  }
};

const toPascalName = (name) => camelCase(String(name || ''));

const buildDocsToc = (entries) => {
  const lines = ['| 组件 | 简介 |', '|------|------|'];
  entries.forEach(({ pascalName, summary }) => {
    lines.push(`| [${pascalName}](docs/${pascalName}.md) | ${escapeTableCell(summary)} |`);
  });
  return lines.join('\n');
};

/**
 * 生成各组件 README.md，写入 docs/{PascalName}.md，根 README 的 DOC_MD 仅保留目录表。
 * @param {object} [options]
 * @param {string} [options.moduleBaseDir]
 * @param {string} [options.rootReadme]
 * @param {string} [options.docsDir]
 * @param {Function} [options.getModuleList]
 */
const buildComponentDocs = async (options = {}) => {
  const moduleBaseDir = options.moduleBaseDir || env.moduleBaseDir;
  const rootReadme = options.rootReadme || path.resolve(env.appDir, 'README.md');
  const docsDir = options.docsDir || path.resolve(env.appDir, 'docs');
  const listLoader = options.getModuleList || getModuleList;
  const list = await listLoader(moduleBaseDir);

  await Promise.all(list.map((props) => stringify(props)));

  const sorted = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  await fs.ensureDir(docsDir);

  const tocEntries = [];
  const writtenFiles = new Set();
  const seenPascal = new Map();

  for (const item of sorted) {
    const { name, baseDir } = item;
    const pascalName = toPascalName(name);
    if (!pascalName) {
      continue;
    }

    if (seenPascal.has(pascalName)) {
      console.warn(
        `[build-component-docs] PascalCase 重名: ${seenPascal.get(pascalName)} 与 ${name} → ${pascalName}.md，后者覆盖前者`
      );
    }
    seenPascal.set(pascalName, name);

    const readmePath = path.join(baseDir, 'README.md');
    if (!(await fs.exists(readmePath))) {
      continue;
    }

    const content = (await fs.readFile(readmePath, 'utf8')).trim();
    const docsFile = `${pascalName}.md`;
    await fs.writeFile(path.join(docsDir, docsFile), `${content}\n`);
    writtenFiles.add(docsFile);

    const summary = await resolveComponentSummary(baseDir);
    tocEntries.push({ name, pascalName, summary });
  }

  // 清理 docs/ 中未再生成的旧 md（含历史非大驼峰文件名）
  const existing = await fs.readdir(docsDir);
  await Promise.all(
    existing.map(async (file) => {
      if (!file.endsWith('.md') || writtenFiles.has(file)) {
        return;
      }
      await fs.remove(path.join(docsDir, file));
    })
  );

  tocEntries.sort((a, b) => a.pascalName.localeCompare(b.pascalName));
  await upsertDocMdSection(rootReadme, buildDocsToc(tocEntries));

  // 完整聚合文档（供 build/README.md，与根 README 目录表无关）
  const fullParts = [];
  for (const { pascalName } of tocEntries) {
    const filePath = path.join(docsDir, `${pascalName}.md`);
    if (await fs.exists(filePath)) {
      fullParts.push((await fs.readFile(filePath, 'utf8')).trim());
    }
  }
  const fullReadme = `${DOC_MD_START}\n\n${fullParts.join('\n\n')}\n\n${DOC_MD_END}\n`;

  return { list: sorted, rootReadme, docsDir, tocEntries, fullReadme };
};

module.exports = buildComponentDocs;
module.exports.upsertDocMdSection = upsertDocMdSection;
module.exports.toPascalName = toPascalName;
module.exports.buildDocsToc = buildDocsToc;
module.exports.resolveComponentSummary = resolveComponentSummary;
module.exports.DOC_MD_START = DOC_MD_START;
module.exports.DOC_MD_END = DOC_MD_END;

if (require.main === module) {
  buildComponentDocs().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
