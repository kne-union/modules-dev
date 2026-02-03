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
