```js
const {CracoRemoteComponentsPlugin, CracoLibsExamplePlugin, env} = require('@kne/modules-dev');
```

### CracoRemoteComponentsPlugin

用于远程组件项目的 Craco 插件，自动配置文档解析、模块联邦和 CSS Modules 支持。生产构建会关闭 webpack `concatenateModules`（scope hoisting），避免 Module Federation 与 ESM babel helpers / locale 拼进同一作用域时出现 `Cannot access ... before initialization`。开发态 `start` 不受影响。

CSS Modules 类名从 2.4.21 起会对「内层 getLocalIdent（含 CRA 内部哈希）与追加的版本哈希」拼成的**完整最终类名**做安全编码：`+` 换成 `-`、`/` 换成 `_`、去掉 `=`。这是为了避免 `postcss-selector-parser@7.2.0` 对 css-loader 已转义的 `+` 等字符再次转义（例如 `k\+uRt` 变成 `k\\\+uRt`），导致 CSS 选择器与 JS 导出名不一致、样式失效。只改版本哈希不够，CRA 内部哈希里的 `+`（如 `k+uRt`）也必须处理。

这会改变含上述字符的生成类名（如 `style_container__k+uRt__uQvZP` 变为 `style_container__k-uRt__uQvZP`），属于破坏性变更：升级本包后须**重新构建并用同一构建的 JS 与 CSS 成套发布**，不能与旧产物混用。导出 key（本地名，如 `container`、`is-mobile`）不变，本地名中已有的连字符也不会被改写。若本地名本身含 `+`、`/` 或 `=`（非标准写法），会被同样替换，可能与原本就带 `-`/`_` 的本地名在类名上接近，实际项目中此类本地名很少见。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| middleware | 中间件配置 | object | undefined |
| reactCompiler | React Compiler 开关，默认关闭；业务项目零额外安装、React 18/19 自动适配 | boolean / object | false |

### reactCompiler（仅 CracoRemoteComponentsPlugin）

默认关闭，不配置时构建行为与旧版本完全一致。`babel-plugin-react-compiler@1.0.0` 与 `react-compiler-runtime@1.0.0` 已作为 `@kne/modules-dev` 的固定版本依赖内置，**业务项目不需要安装、升级或声明任何额外包**，也不需要区分自己用的是 React 18 还是 19。

在 `craco.config.js` 里显式加一个字段即可开启：

```js
const {CracoRemoteComponentsPlugin} = require("@kne/modules-dev");

module.exports = {
    plugins: [{
        plugin: CracoRemoteComponentsPlugin,
        options: {reactCompiler: true}
    }]
};
```

也支持写在配置顶层（`module.exports = { reactCompiler: true, plugins: [...] }`），两种写法等价，插件 options 优先。

##### React 18 / 19 的兼容方式

编译器默认以 `target: '18'` 生成对 `react-compiler-runtime` 的引用，这份 runtime 由 modules-dev 提供，并通过追加 `resolve.modules` 让业务项目无需安装也能解析到（不用 `resolve.alias`，以保留产物里的原始包名给模块联邦做 shared 匹配）。它在 React 19 下会自动委托给 `React.__COMPILER_RUNTIME.c`（即 React 19 原生的 `useMemoCache`，与官方 `react/compiler-runtime` 等价），在 React 17/18 下回退到 `React.useMemo`，因此对宿主 React 主版本不敏感，很适合发 CDN 的 remote 产物。

如果明确希望走 React 19 内置的 `react/compiler-runtime`（要求业务项目的 react 提供该子路径），可显式设置 `target: '19'`；缺失时会给出明确报错并提示去掉该配置。

传对象可覆盖编译器选项，字段原样透传给 `babel-plugin-react-compiler`：

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| target | 最低 React 版本，取值 17 / 18 / 19；设为 19 时改用 react 内置 runtime | string | `18`（统一使用自带 runtime） |
| compilationMode | 设为 `annotation` 时只编译带 `"use memo"` 的组件 | string | 编译器默认 |
| panicThreshold | 违反 Rules of React 时的处理方式 | string | `none`（跳过问题组件，不阻断构建） |
| plugin | 自定义编译器插件模块名或路径 | string | `babel-plugin-react-compiler`（内置） |
| 其它 | 任意 React Compiler 配置，如 `sources`、`gating` | - | - |

默认插件强制使用 modules-dev 内置的 1.0.0，业务项目里残留的旧版或 beta 编译器不会生效，保证各 remote 产物一致；只有显式设置 `plugin` 才改用业务项目自己提供的编译器（这种情况下才需要业务项目自行安装）。

开启后 modules-dev 会做五件事：从自身依赖解析编译器插件并 unshift 到 app 源码 babel-loader 的 `plugins[0]`，保证早于 `react-refresh/babel` 与 JSX preset，且不影响处理 node_modules 的那条规则；按编译配置更新 `cacheIdentifier`，避免 `.cache` 复用未编译产物；把自带 runtime 所在的 `node_modules` 追加到 `resolve.modules` 末尾；把 `react-compiler-runtime`（或显式 target 19 时的 `react/compiler-runtime`）加入模块联邦 shared 单例；包装并保留业务方原有的 MF `middleware`。

验证方式：React DevTools 里组件出现 `Memo ✨` 徽标；构建产物能搜到 `compiler-runtime`；首次开启若产物没变化，停服务清项目根 `.cache` 后重启（升级编译器插件后同样建议清一次）。按既有经验，宿主加载的 remote 需要用带此开关的 modules-dev 版本一起重建发版，再改宿主 `defaultVersion`；只升级宿主不会让旧 CDN 产物受益。

关闭只需删掉 `reactCompiler` 或置为 `false`。组件库示例项目（CracoLibsExamplePlugin）暂不覆盖此开关。

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

### buildComponentDocs

生成各组件 README，并将完整文档写入项目根 `docs/{PascalName}.md`（文件名强制大驼峰，如 `button-group` → `ButtonGroup.md`）；根 README 的 `<!--START_SECTION:DOC_MD-->` 段只写入组件目录表（名称 + 简介 + 相对链接）。production 构建时另生成**完整聚合** `build/README.md`（含全部组件文档，与根目录 README 无关）；`docs/` 不进入 `build/`。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| moduleBaseDir | 组件目录 | string | `env.moduleBaseDir` |
| rootReadme | 根 README 路径 | string | `{appDir}/README.md` |
| docsDir | 文档输出目录 | string | `{appDir}/docs`（libs-example 为 `../docs`） |
| getModuleList | 自定义模块列表加载 | function | 内置 `getModuleList` |

```js
const { buildComponentDocs } = require('@kne/modules-dev');
await buildComponentDocs();
// 或 CLI：modules-dev-build-docs / npm run build:docs
```

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

`createEntry(WrappedComponents, options)` 的第二个参数：

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| paths | 追加到「首页」「组件」之后的导航项 `[{ key, path, title, component }]`；`path` 相对 baseUrl（如 `/modules-dev-apis`），`component` 作为该路径的页面渲染，接收与业务组件相同的 props | array | [] |

```js
// bootstrap.js 开发分支：给开发导航加一个页面
import('@kne/modules-dev/dist/create-entry.modern').then(module => {
  const Entry = module.default(App, {
    paths: [{ key: 'apis', path: '/modules-dev-apis', title: '接口', component: ApiDoc }]
  });
});
```

### createEntry.ExampleRoutes

示例路由组件，用于渲染组件示例页面。

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
| readme | 组件 README 数据 | object | - |
| paths | 路径配置列表 `[{ key, path, title, element }]`；`key` 为 `components` 的项挂组件示例，其余带 `element` 的项在该路径下渲染 `element` | array | - |
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
import {ExampleDriverContext} from '@kne/modules-dev/dist/index';
```

### ExampleDriverContext

示例 `contextComponent` 包装器（`GlobalProvider` + `MemoryRouter`）。响应式上下文由 `@kne/example-driver` LiveCode 内注入，无需在此层再包 `ResponsiveProvider`。

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
