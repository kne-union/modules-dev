
# modules-dev


### 描述

用于辅助在项目内启动一个规范化组件开发的环境


### 安装

```shell
npm i --save @kne/modules-dev
```


### 概述

modules-dev 是一个强大的组件开发辅助工具，为你的远程组件或前端库项目提供完整的开发环境。无论是实时预览组件示例，还是生成可集成到文档系统的代码，modules-dev 都能轻松应对。

### 核心特性

- **零配置开箱即用**：基于 Craco 封装的构建插件，支持远程组件和组件库两种场景
- **实时预览**：开发环境支持组件示例的实时预览，所见即所得
- **文档自动生成**：自动解析 `doc/` 目录下的文档和示例代码
- **命令行工具**：提供 `modules-dev-create` 和 `modules-dev-libs-init` 快速创建组件目录结构
- **模块联邦支持**：内置 Webpack Module Federation 支持，方便远程组件开发
- **灵活的路径配置**：通过环境变量自定义组件目录和别名

### 应用场景

1. **远程组件开发**：在开发远程组件时提供实时预览环境，组件发布后可集成到 kne-union 文档系统
2. **组件库开发**：为前端组件库提供统一的示例展示和文档生成能力
3. **业务项目调试**：在开发模式下集成示例预览，快速验证组件功能

### 构建工具使用

#### 远程组件项目

在项目的 `craco.config.js` 中配置 CracoRemoteComponentsPlugin：

```js
const {CracoRemoteComponentsPlugin} = require("@kne/modules-dev");

module.exports = {
    plugins: [{
        plugin: CracoRemoteComponentsPlugin
    }]
};
```

#### 组件库项目

在示例目录的 `example/craco.config.js` 中配置 CracoLibsExamplePlugin：

```js
const {CracoLibsExamplePlugin} = require("@kne/modules-dev");

module.exports = {
    plugins: [{
        plugin: CracoLibsExamplePlugin
    }]
};
```

### Example 组件使用

#### 远程组件库项目

```jsx
import createEntry from "@kne/modules-dev/dist/create-entry";
import "@kne/modules-dev/dist/create-entry.css";
import readme from "readme";

const ExampleRoutes = createEntry.ExampleRoutes;

const App = ({preset, themeToken, ...props}) => {
    return (<HashRouter>
        <ExampleRoutes
            {...props}
            paths={[{
                key: "components", path: "/", title: "首页",
            },]}
            preset={preset}
            themeToken={themeToken}
            readme={readme}
        />
    </HashRouter>);
};
```

#### 业务项目集成开发模式

```jsx
if (process.env.NODE_ENV === 'development') {
    import('@kne/modules-dev/dist/create-entry.css');
    import('@kne/modules-dev/dist/create-entry').then(module => {
        const Entry = module.default(App);
        root.render(<Entry preset={globalPreset} projectName="erc" themeToken={globalPreset.themeToken}/>);
    });
} else {
    root.render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    );
}
```

### 命令行工具

- `modules-dev-create`：在远程组件项目中创建新的组件目录结构和文档模板
- `modules-dev-libs-init`：为前端库项目初始化示例开发环境

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MODULES_DEV_BASE_DIR | 组件基础目录 | ./src/components |
| MODULES_DEV_ALIAS_NAME | 组件别名 | @components |
| MODULES_DEV_STATIC_BASE_URL | 静态资源基础路径 | /ui_components |
| MODULES_DEV_PUBLIC_URL | 公共 URL | 自动生成 |
| CURRENT_VERSION | 当前版本 | 从 package.json 读取 |
| OPEN_CURRENT_VERSION | 是否在 URL 中显示版本号 | true |


### 示例

#### 示例代码

- 基础用法
- 展示 createEntry 的基本使用方式，包装业务组件并集成开发环境功能
- _ModulesDev(@kne/modules-dev)[import * as _ModulesDev from "@kne/modules-dev"],remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { createEntry, ExampleRoutes } = _ModulesDev;
const { createWithRemoteLoader, getPublicPath } = remoteLoader;
const { Card, Typography, Space } = antd;
const { useState } = React;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:InfoPage']
})(({ remoteModules }) => {
  const [PureGlobal, InfoPage] = remoteModules;
  const [wrapped, setWrapped] = useState(true);

  const MockComponent = () => (
    <Card title="业务组件" style={{ maxWidth: 400 }}>
      <Typography.Paragraph>这是一个模拟的业务组件内容</Typography.Paragraph>
    </Card>
  );

  const WrappedComponent = createEntry(MockComponent);

  return (
    <PureGlobal preset={{
      ajax: async api => {
        return { data: { code: 0, data: api.loader() } };
      },
      apis: {
        example: {
          staticUrl: getPublicPath('modules-dev') || window.PUBLIC_URL,
          getUrl: {
            loader: async ({ params }) => {
              return 'mock-data';
            }
          }
        }
      }
    }}>
      <InfoPage>
        <InfoPage.Part title="基础用法">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Typography.Title level={3}>createEntry 高阶组件</Typography.Title>
            <Typography.Paragraph>
              createEntry 是一个高阶组件工厂函数，用于包装业务组件，
              集成开发环境的文档预览功能。当存在组件 README 数据时，
              会自动显示组件导航和示例页面。
            </Typography.Paragraph>
            <Card title="控制面板">
              <Space>
                <Typography.Text>启用包装:</Typography.Text>
                <Typography.Switch checked={wrapped} onChange={setWrapped} />
              </Space>
            </Card>
            <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
              {wrapped ? <WrappedComponent /> : <MockComponent />}
            </div>
          </Space>
        </InfoPage.Part>
      </InfoPage>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

- FontList 图标列表
- 使用 FontList 组件展示和预览图标字体
- _ModulesDev(@kne/modules-dev)[import * as _ModulesDev from "@kne/modules-dev"],remoteLoader(@kne/remote-loader),antd(antd)

```jsx
const { FontList } = _ModulesDev;
const { createWithRemoteLoader, getPublicPath } = remoteLoader;
const { Space, Typography, Card } = antd;

const FontListExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:InfoPage']
})(({ remoteModules }) => {
  const [PureGlobal, InfoPage] = remoteModules;

  return (
    <PureGlobal preset={{
      ajax: async api => {
        return { data: { code: 0, data: api.loader() } };
      },
      apis: {
        example: {
          staticUrl: getPublicPath('modules-dev') || window.PUBLIC_URL,
          getUrl: {
            loader: async ({ params }) => {
              return {
                'kne-font': {
                  glyphs: [
                    { font_class: 'icon-home' },
                    { font_class: 'icon-user' },
                    { font_class: 'icon-setting' },
                    { font_class: 'icon-delete' },
                    { font_class: 'icon-edit' },
                    { font_class: 'icon-add' }
                  ]
                },
                'kne-font-colorful': {
                  glyphs: [
                    { font_class: 'icon-star' },
                    { font_class: 'icon-heart' },
                    { font_class: 'icon-check' }
                  ]
                }
              };
            }
          }
        }
      }
    }}>
      <InfoPage>
        <InfoPage.Part title="FontList 图标列表">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Typography.Title level={3}>图标字体预览组件</Typography.Title>
            <Typography.Paragraph>
              FontList 组件用于展示和预览图标字体，支持调整图标大小，
              点击图标名称可以复制使用代码。
            </Typography.Paragraph>
            <Card title="示例展示">
              <FontList fonts={{
                'kne-font': {
                  glyphs: [
                    { font_class: 'icon-home' },
                    { font_class: 'icon-user' },
                    { font_class: 'icon-setting' },
                    { font_class: 'icon-delete' },
                    { font_class: 'icon-edit' },
                    { font_class: 'icon-add' }
                  ]
                },
                'kne-font-colorful': {
                  glyphs: [
                    { font_class: 'icon-star' },
                    { font_class: 'icon-heart' },
                    { font_class: 'icon-check' }
                  ]
                }
              }} />
            </Card>
          </Space>
        </InfoPage.Part>
      </InfoPage>
    </PureGlobal>
  );
});

render(<FontListExample />);

```

- Highlight 代码高亮
- 使用 Highlight 组件实现代码语法高亮显示
- _ModulesDev(@kne/modules-dev)[import * as _ModulesDev from "@kne/modules-dev"],antd(antd)

```jsx
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

```


### API

```js
const {CracoRemoteComponentsPlugin, CracoLibsExamplePlugin, env} = require('@kne/modules-dev');
```

### CracoRemoteComponentsPlugin

用于远程组件项目的 Craco 插件，自动配置文档解析、模块联邦和 CSS Modules 支持。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| middleware | 中间件配置 | object | undefined |

### CracoLibsExamplePlugin

用于组件库示例项目的 Craco 插件，自动配置文档解析、版本管理和模块联邦支持。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| middleware | 中间件配置 | object | undefined |

### env

环境变量配置对象，提供项目构建所需的各种路径和配置信息。

| 属性名 | 说明 | 类型 |
|-----|----|----|
| appDir | 应用根目录 | string |
| manifestPath | manifest 文件路径 | string |
| staticBaseUrl | 静态资源基础 URL | string |
| moduleBasePath | 组件基础路径 | string |
| moduleBaseDir | 组件基础目录（绝对路径） | string |
| moduleAliasName | 组件别名名称 | string |
| templateDir | 模板目录 | string |
| templateLibsExampleDir | 组件库示例模板目录 | string |
| componentsName | 组件名称 | string |
| openComponentsVersion | 是否在 URL 中显示版本号 | boolean |
| componentsVersion | 组件版本号 | string |
| publicUrl | 公共 URL | string |

```js
import createEntry from '@kne/modules-dev/dist/create-entry';

const Entry = createEntry(children);
```

### createEntry

高阶组件工厂函数，用于包装业务组件，集成开发环境的文档预览功能。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| children | 要包装的业务组件 | ReactComponent | - |
| preset | 全局预设配置 | object | - |
| projectName | 项目名称 | string | - |
| themeToken | 主题配置 | object | - |
| pageProps | 页面属性 | object | - |
| baseUrl | 基础路径 | string | '' |

### createEntry.ExampleRoutes

示例路由组件，用于渲染组件示例页面。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| readme | 组件 README 数据 | object | - |
| paths | 路径配置列表 | array | - |
| preset | 全局预设配置 | object | - |
| themeToken | 主题配置 | object | - |
| baseUrl | 基础路径 | string | '' |
| projectName | 项目名称 | string | - |
| pageProps | 页面属性 | object | - |
| children | 子路由内容 | ReactNode | - |

### createEntry.Example

单个组件示例展示组件。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| baseUrl | 基础路径 | string | - |
| readme | 组件 README 数据 | object | - |
| pageProps | 页面属性 | object | - |

### createEntry.ExamplePage

示例页面组件，用于展示组件文档和代码示例。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| data | 组件数据 | object | - |
| current | 当前组件 ID | string | - |
| items | 组件列表 | array | - |
| pageProps | 页面属性 | object | - |

### createEntry.ExampleContent

示例内容组件，渲染组件的描述、概述、代码示例和 API 文档。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| data | 组件数据 | object | - |

```js
import {FontList} from '@kne/modules-dev/dist/index';
```

### FontList

图标字体列表展示组件，用于预览和复制图标代码。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| fonts | 图标字体数据 | object | - |

```js
import {Example} from '@kne/modules-dev/dist/index';
```

### Example

组件示例展示组件（别名，同 createEntry.Example）。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| baseUrl | 基础路径 | string | - |
| readme | 组件 README 数据 | object | - |
| pageProps | 页面属性 | object | - |

```js
import {ExamplePage} from '@kne/modules-dev/dist/index';
```

### ExamplePage

示例页面组件（别名，同 createEntry.ExamplePage）。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| data | 组件数据 | object | - |
| current | 当前组件 ID | string | - |
| items | 组件列表 | array | - |
| pageProps | 页面属性 | object | - |

