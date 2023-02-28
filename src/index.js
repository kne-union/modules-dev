import React from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation, Outlet} from 'react-router-dom';
import {createWithRemoteLoader} from '@kne/remote-loader';
import ensureSlash from '@kne/ensure-slash';
import {Result, FloatButton} from 'antd';
import {ToolOutlined} from '@ant-design/icons';
import Example from './Example';
import readme from "readme";

const ModulesIsEmpty = ({readme}) => {
    const location = useLocation();
    if (readme && Object.keys(readme).length > 0 && ensureSlash(location.pathname) === '/modules-dev') {
        return <Navigate to={`/modules-dev/${Object.keys(readme)[0]}`}/>;
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


const createEntry = (WrappedComponents) => createWithRemoteLoader({
    modules: ["Global", "Layout"]
})(({remoteModules, ...props}) => {
    const [Global, Layout] = remoteModules;
    return <BrowserRouter>
        <Routes>
            <Route path="/modules-dev" element={<ModulesIsEmpty readme={readme}/>}>
                <Route path=":id" element={<Global><Layout><Example readme={readme}/></Layout></Global>}/>
            </Route>
            <Route path='*'
                   element={<><WrappedComponents {...props}/><FloatButton icon={<ToolOutlined />} onClick={() => {
                       window.location.href = '/modules-dev';
                   }}/></>}/>
        </Routes>
    </BrowserRouter>;
});

export default createEntry;