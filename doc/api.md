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
