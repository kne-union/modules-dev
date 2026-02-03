const { Highlight } = _ModulesDev;
const { Space, Typography, Card, Input } = antd;
const { useState } = React;

const codeTemplate = `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello World</h1>
      <p>Welcome to React</p>
    </div>
  );
}

export default App;`;

const HighlightExample = () => {
  const [code, setCode] = useState(codeTemplate);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3}>Highlight 代码高亮组件</Typography.Title>
      <Typography.Paragraph>
        Highlight 组件基于 highlight.js 实现，支持多种编程语言的语法高亮显示。
      </Typography.Paragraph>
      <Card title="代码输入">
        <Input.TextArea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={8}
          placeholder="输入要高亮的代码"
        />
      </Card>
      <Card title="高亮效果">
        <Highlight html={`<pre><code class="language-javascript hljs">${escapeHtml(code)}</code></pre>`} />
      </Card>
    </Space>
  );
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

render(<HighlightExample />);
