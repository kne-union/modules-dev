import React from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, Outlet} from 'react-router-dom';
import {createWithRemoteLoader} from '@kne/remote-loader';
import ensureSlash from '@kne/ensure-slash';
import {Result, FloatButton} from 'antd';
import {ToolOutlined} from '@ant-design/icons';
import Example from './Example';
import readme from "readme";
import ExamplePage from './ExamplePage';

const ModulesIsEmpty = ({readme}) => {
    const location = useLocation();
    if (readme && Object.keys(readme).length > 0 && ensureSlash(location.pathname) === '/modules-dev/components') {
        return <Navigate to={`/modules-dev/components/${Object.keys(readme)[0]}`}/>;
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

const EntryButton = () => {
    const navigate = useNavigate();
    return <FloatButton icon={<ToolOutlined/>} onClick={() => {
        navigate('/modules-dev/components');
    }}/>;
};


const createEntry = (WrappedComponents) => createWithRemoteLoader({
    modules: ["components-core:Global", "components-core:Layout", "components-function:PostCat", "components-function:PostCat@defaultApis"]
})(({remoteModules, preset, ...props}) => {
    const [Global, Layout, PostCat, defaultApis] = remoteModules;
    return <BrowserRouter>
        <Routes>
            <Route path="/modules-dev">
                <Route element={<Global preset={preset}><Layout navigation={{
                    list: [{
                        key: 'components', title: '组件', path: '/modules-dev/components'
                    }, {
                        key: 'api', title: '接口', path: '/modules-dev/api'
                    }]
                }}><Outlet/></Layout></Global>}>
                    <Route path="components" element={<ModulesIsEmpty readme={readme}/>}>
                        <Route path=":id" element={<Example readme={readme}/>}/>
                    </Route>
                    <Route path="api" element={<PostCat apis={defaultApis}/>}/>
                </Route>
            </Route>
            <Route path='*'
                   element={<><WrappedComponents {...props}/><EntryButton/></>}/>
        </Routes>
    </BrowserRouter>;
});

createEntry.ExamplePage = ExamplePage;

export default createEntry;