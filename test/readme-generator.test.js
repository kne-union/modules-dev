const { expect } = require('chai');
const { parse } = require('@kne/md-doc');
const readmeGenerator = require('../lib/readme-generator');

describe('readme-generator', () => {
  it('应输出 list[].isFull 供 ExampleDriver 单条全宽展示', () => {
    const md = `# BizUnit

### 概述

Summary

### 示例

#### 示例代码

- 组织架构（Layout@TablePage 多页面）(全屏)
- 多页面示例
- _BizUnit(@components/BizUnit)

\`\`\`jsx
render(<div />);
\`\`\`

- 角色管理（基础 CRUD）
- 基础示例
- _BizUnit(@components/BizUnit)

\`\`\`jsx
render(<span />);
\`\`\`

### API`;

    const parsed = parse(md);
    const output = readmeGenerator({
      name: parsed.name,
      summary: parsed.summary,
      api: parsed.api,
      example: parsed.example
    });

    expect(parsed.example.list[0]).to.have.property('isFull', true);
    expect(parsed.example.list[1]).to.not.have.property('isFull');
    expect(output).to.match(/title: `组织架构（Layout@TablePage 多页面）`[\s\S]*?isFull: true/);
    const normalBlock = output.match(/title: `角色管理（基础 CRUD）`[\s\S]*?scope: \[/)[0];
    expect(normalBlock).to.not.include('isFull: true');
  });
});
