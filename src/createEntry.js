import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate, Outlet} from 'react-router-dom';
import {createWithRemoteLoader} from '@kne/remote-loader';
import ensureSlash from '@kne/ensure-slash';
import {Result, FloatButton} from 'antd';
import Example from './Example';
import ExamplePage, {ExampleContent} from './ExamplePage';
import get from 'lodash/get';

const ModulesIsEmpty = ({readme, baseUrl}) => {
    const location = useLocation();
    if (readme && Object.keys(readme).length > 0 && ensureSlash(location.pathname, true) === baseUrl) {
        return <Navigate to={`${baseUrl}${Object.keys(readme)[0]}`}/>;
    }
    if (readme && Object.keys(readme).length > 0) {
        return <Outlet/>
    }
    return <Result
        status="404"
        title="没有检测到业务组件"
        subTitle="您可以通过 modules-dev create 命令创建组件，如果已经有组件请检查环境变量 MODULES_DEV_BASE_DIR和MODULES_DEV_ALIAS_NAME 是否设置正确"
    />
};

const EntryButton = createWithRemoteLoader({
    modules: ['components-core:Icon']
})(({remoteModules}) => {
    const [Icon] = remoteModules;
    const navigate = useNavigate();
    return <FloatButton icon={<Icon className="icon" type="icon-liangdian"/>} onClick={() => {
        navigate('/modules-dev-components');
    }}/>;
});

const MainLayout = createWithRemoteLoader({
    modules: ["components-core:Global", "components-core:Layout"]
})(({remoteModules, paths, preset, ...props}) => {
    const [Global, Layout] = remoteModules;
    return <Global {...props} preset={preset}><Layout navigation={{
        showIndex: false, list: paths
    }}><Outlet/></Layout></Global>;
});

const ExampleRoutes = ({
                           preset, themeToken, projectName, baseUrl = '', paths = [{
        key: 'index', path: '/', title: '首页'
    }, {
        key: 'components', path: `${baseUrl}/components`, title: '组件'
    }], readme, pageProps, children, ...props
                       }) => {
    const componentsPath = paths.find((item) => item.key === 'components');
    const componentsBaseUrl = ensureSlash(get(componentsPath, 'path', '/'), true);
    const baseUrlPrefix = new RegExp(`^${ensureSlash(baseUrl,true)}`);
    const componentsRoutePath = ensureSlash(componentsBaseUrl.replace(baseUrlPrefix, ''));
    return <Routes>
        <Route element={<MainLayout paths={paths} preset={preset} themeToken={themeToken} {...props}/>}>
            {componentsPath && <Route path={componentsRoutePath}
                                      element={<ModulesIsEmpty baseUrl={componentsBaseUrl} readme={readme}/>}>
                <Route path=":id"
                       element={<Example baseUrl={componentsBaseUrl} readme={readme} pageProps={pageProps}/>}/>
                <Route path=":id/*"
                       element={<Example baseUrl={componentsBaseUrl} readme={readme} pageProps={pageProps}/>}/>
            </Route>}
        </Route>
        <Route path='*' element={children}/>
    </Routes>
};


const createEntry = (WrappedComponents) => (({
                                                 remoteModules,
                                                 preset,
                                                 projectName,
                                                 themeToken,
                                                 pageProps,
                                                 baseUrl = '',
                                                 ...props
                                             }) => {
    const [readme, setReadme] = useState({});
    useEffect(() => {
        import('readme').then((module) => {
            setReadme(module.__esModule === true ? module.default : module);
        });
    }, []);
    return <>
        {Object.keys(readme).length > 0 ?
            <ExampleRoutes preset={preset} baseUrl={baseUrl} projectName={projectName} readme={readme}
                           pageProps={pageProps}
                           paths={[{
                               key: 'index', path: '/', title: '首页'
                           }, {
                               key: 'components', path: `${baseUrl}/modules-dev-components`, title: '组件'
                           }]}
                           themeToken={themeToken}>
                <WrappedComponents {...props}/><EntryButton/>
            </ExampleRoutes> : <WrappedComponents {...props}/>}
    </>;
});
createEntry.Example = Example;
createEntry.ExampleRoutes = ExampleRoutes;
createEntry.ExamplePage = ExamplePage;
createEntry.ExampleContent = ExampleContent;

export default createEntry;
