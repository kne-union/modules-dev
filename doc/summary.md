modules-dev为所有的项目提供了一个开发环境，让你在开发远程组件或者前端库时有一个运行时的示例展示，并且当对你的项目进行发布的时候可以集成到kne-union文档之中

modules-dev分为三个部分

1. 构建工具部分，它在craco基础上封装了一系列插件用以支持文档解析已经远程组件支持
2. Example部分，它给前端提供了一个集成化的开发环境用来实时预览组件的example部分
3. 脚手架模板部分，它提供了两个命令行工具 modules-dev-create 和
   modules-dev-libs-init，modules-dev-create可以在远程组件项目中添加一个新的组件即文档目录结构，modules-dev-libs-init可以给前端库提供一个可以运行的开发环境。

### 构建工具使用

1. 远程组件
   craco.config.js

```js
const {CracoRemoteComponentsPlugin} = require("@kne/modules-dev");

module.exports = {
    plugins: [{
        plugin: CracoRemoteComponentsPlugin
    }]
};
```

2. 组件库

example/craco.config.js

```js
const {CracoLibsExamplePlugin} = require("@kne/modules-dev");

module.exports = {
    plugins: [{
        plugin: CracoLibsExamplePlugin
    }]
};
```

注意：以上代码通常由命令行工具生成，不需要自己编写

### Example部分使用

1. 远程组件库中

src/App.js

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

2. 业务项目中

src/bootstrap.js

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

注意：以上代码通常由命令行工具生成，不需要自己编写
