const crypto = require('crypto');
const path = require('path');
const env = require('./env');

const DEFAULT_PLUGIN_NAME = 'babel-plugin-react-compiler';
const LEGACY_RUNTIME = 'react-compiler-runtime';
const REACT_19_RUNTIME = 'react/compiler-runtime';
// 统一走 modules-dev 自带的 runtime：React 19 会自动委托 React.__COMPILER_RUNTIME.c，
// React 17/18 回退到 React.useMemo。这样业务项目装的是 React 18 还是 19 都无需区分。
const DEFAULT_TARGET = '18';

// 默认关闭。开关可写在插件 options，也可写在 craco.config.js 顶层。
const getCompilerInput = (pluginOptions, cracoConfig) => {
    if (pluginOptions && pluginOptions.reactCompiler !== undefined) {
        return pluginOptions.reactCompiler;
    }
    if (cracoConfig && cracoConfig.reactCompiler !== undefined) {
        return cracoConfig.reactCompiler;
    }
    return false;
};

const isEnabled = (input) => input === true || (typeof input === 'object' && input !== null);

const normalizeTarget = (target) => {
    const value = String(target);
    if (!['17', '18', '19'].includes(value)) {
        throw new Error(`[modules-dev] reactCompiler.target 只支持 17 / 18 / 19，收到 ${value}`);
    }
    return value;
};

// 纯函数：算出插件名、目标 React 版本与透传给编译器的 options
const buildCompilerConfig = (input) => {
    const userOptions = isEnabled(input) && typeof input === 'object' ? Object.assign({}, input) : {};
    const pluginName = userOptions.plugin || DEFAULT_PLUGIN_NAME;
    delete userOptions.plugin;
    const target = userOptions.target !== undefined ? normalizeTarget(userOptions.target) : DEFAULT_TARGET;
    userOptions.target = target;
    // 违反 Rules of React 的组件跳过优化，而不是让整个构建失败
    const compilerOptions = Object.assign({panicThreshold: 'none'}, userOptions);
    return {pluginName, target, compilerOptions};
};

// 优先业务项目（允许自行覆盖版本），找不到时回落到 modules-dev 自带的依赖。
// 业务项目不需要、也不应该单独安装编译器或 runtime。
const resolveBundled = (request, appDir) => {
    const paths = [appDir, __dirname, path.resolve(__dirname, '..')].filter(Boolean);
    try {
        return require.resolve(request, {paths});
    } catch (e) {
        return null;
    }
};

// 只在业务项目自身范围内解析，不能用 modules-dev 自己的 react 当依据
const resolveFromApp = (request, appDir = env.appDir) => {
    try {
        return require.resolve(request, {paths: [appDir]});
    } catch (e) {
        return null;
    }
};

const resolveCompilerPlugin = (pluginName, appDir = env.appDir) => {
    // 默认插件强制用内置版本：业务项目里残留的旧版/beta 编译器不应影响构建结果；
    // 只有显式传了 plugin 才允许业务项目自己提供。
    const isDefault = pluginName === DEFAULT_PLUGIN_NAME;
    const paths = isDefault
        ? [__dirname, path.resolve(__dirname, '..')]
        : [appDir, __dirname, path.resolve(__dirname, '..')].filter(Boolean);
    let resolved = null;
    try {
        resolved = require.resolve(pluginName, {paths});
    } catch (e) {
        // 落到下面的统一报错
    }
    if (resolved) {
        return resolved;
    }
    throw new Error([
        `[modules-dev] reactCompiler 已开启，但无法解析编译器 ${pluginName}。`,
        '编译器由 @kne/modules-dev 自带，业务项目无需单独安装；请重装 @kne/modules-dev，',
        '或检查部署/构建环境是否裁剪了 dependencies。'
    ].join(''));
};

// 把自带 runtime 所在的 node_modules 目录加到 webpack 查找路径末尾。
// 用 resolve.modules 而不是 alias，是为了保留产物里 require('react-compiler-runtime')
// 的原始 request，让模块联邦的 shared 单例仍能按包名匹配。
const resolveRuntimeModulesDir = () => {
    const pkg = resolveBundled(`${LEGACY_RUNTIME}/package.json`, null);
    if (!pkg) {
        throw new Error(`[modules-dev] 内置的 ${LEGACY_RUNTIME} 缺失，请重装 @kne/modules-dev，业务项目无需单独安装。`);
    }
    return path.dirname(path.dirname(pkg));
};

const injectRuntimeResolution = (webpackConfig, target) => {
    if (target === '19') {
        // React 19 自带 react/compiler-runtime，由业务项目的 react 提供
        return webpackConfig;
    }
    const modulesDir = resolveRuntimeModulesDir();
    const resolve = webpackConfig.resolve || (webpackConfig.resolve = {});
    const modules = Array.isArray(resolve.modules) ? resolve.modules.slice() : ['node_modules'];
    if (!modules.includes(modulesDir)) {
        modules.push(modulesDir);
    }
    resolve.modules = modules;
    return webpackConfig;
};

// 只有显式指定 target: '19' 才依赖 react 的子路径，缺失时给出可执行的提示
const assertReact19Runtime = (target, appDir = env.appDir) => {
    if (target !== '19' || resolveFromApp(REACT_19_RUNTIME, appDir)) {
        return;
    }
    throw new Error([
        `[modules-dev] reactCompiler.target='19' 需要业务项目的 react 提供 ${REACT_19_RUNTIME}。`,
        '去掉 target 配置即可使用自带 runtime（React 18 / 19 均可用），或把项目 react 升到 19。'
    ].join(''));
};

// 编译产物会新增对 compiler runtime 的引用，MF 必须像 jsx-runtime 一样做成单例
const getCompilerSharedEntries = (target) => {
    const name = target === '19' ? REACT_19_RUNTIME : LEGACY_RUNTIME;
    return {[name]: {singleton: true, requiredVersion: false}};
};

const createFederationMiddleware = (userMiddleware, compilerConfig) => (config) => {
    const result = typeof userMiddleware === 'function' ? userMiddleware(config) : config;
    return Object.assign({}, result, {
        shared: Object.assign({}, result.shared, getCompilerSharedEntries(compilerConfig.target))
    });
};

// CRA 有两条 babel-loader 规则：app 源码用 babel-preset-react-app，
// node_modules 用 babel-preset-react-app/dependencies，只改前者。
const findAppBabelLoaders = (webpackConfig) => {
    const found = [];
    const collectUses = (rule) => {
        const uses = [];
        if (rule.loader || (rule.options && !rule.use)) {
            uses.push(rule);
        }
        if (Array.isArray(rule.use)) {
            uses.push(...rule.use);
        } else if (rule.use && typeof rule.use === 'object') {
            uses.push(rule.use);
        }
        return uses;
    };
    const isAppPreset = (options) => {
        const presets = options && options.presets;
        if (!Array.isArray(presets)) {
            return false;
        }
        return presets.some((preset) => {
            const name = Array.isArray(preset) ? preset[0] : preset;
            const value = String(name);
            return value.includes('babel-preset-react-app') && !value.includes('dependencies');
        });
    };
    const visit = (rules) => (rules || []).forEach((rule) => {
        if (!rule) {
            return;
        }
        if (Array.isArray(rule.oneOf)) {
            visit(rule.oneOf);
        }
        collectUses(rule).forEach((use) => {
            if (!use || typeof use !== 'object') {
                return;
            }
            if (!String(use.loader || '').includes('babel-loader')) {
                return;
            }
            if (isAppPreset(use.options)) {
                found.push(use);
            }
        });
    });
    visit(webpackConfig.module && webpackConfig.module.rules);
    return found;
};

const injectCompilerPlugin = (webpackConfig, compilerConfig, pluginPath) => {
    const loaders = findAppBabelLoaders(webpackConfig);
    if (loaders.length === 0) {
        throw new Error('[modules-dev] 没找到 CRA 应用源码的 babel-loader 规则，无法注入 React Compiler，请检查 @kne/react-scripts 版本。');
    }
    // craco 不会因自定义插件更新 cacheIdentifier，这里主动绑定，避免 .cache 复用未编译产物
    const cacheKey = crypto.createHash('md5')
        .update(JSON.stringify({pluginPath, compilerOptions: compilerConfig.compilerOptions}))
        .digest('hex').slice(0, 12);
    const tag = `react-compiler-${cacheKey}`;
    loaders.forEach((use) => {
        const options = use.options;
        options.plugins = options.plugins || [];
        const exists = options.plugins.some((item) => (Array.isArray(item) ? item[0] : item) === pluginPath);
        if (!exists) {
            // 官方要求编译器第一个执行：unshift 到 react-refresh/babel 与 JSX preset 之前
            options.plugins.unshift([pluginPath, compilerConfig.compilerOptions]);
        }
        options.cacheIdentifier = typeof options.cacheIdentifier === 'string'
            ? (options.cacheIdentifier.includes(tag) ? options.cacheIdentifier : `${options.cacheIdentifier}|${tag}`)
            : tag;
    });
    return webpackConfig;
};

module.exports = {
    overrideWebpackConfig({webpackConfig, pluginOptions, cracoConfig}) {
        const input = getCompilerInput(pluginOptions, cracoConfig);
        if (!isEnabled(input)) {
            return webpackConfig;
        }
        const compilerConfig = buildCompilerConfig(input);
        const pluginPath = resolveCompilerPlugin(compilerConfig.pluginName);
        assertReact19Runtime(compilerConfig.target);
        injectCompilerPlugin(webpackConfig, compilerConfig, pluginPath);
        return injectRuntimeResolution(webpackConfig, compilerConfig.target);
    },
    DEFAULT_TARGET,
    getCompilerInput,
    isEnabled,
    buildCompilerConfig,
    resolveCompilerPlugin,
    resolveRuntimeModulesDir,
    injectRuntimeResolution,
    assertReact19Runtime,
    getCompilerSharedEntries,
    createFederationMiddleware,
    findAppBabelLoaders
};
