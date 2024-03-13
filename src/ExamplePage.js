import '@kne/example-driver/dist/index.css';
import React, {useEffect, useMemo} from "react";
import get from "lodash/get";
import {Space} from "antd";
import style from "./example.module.scss";
import classnames from "classnames";
import ExampleDriver from "@kne/example-driver";
import {HashRouter} from "react-router-dom";
import {createWithRemoteLoader} from '@kne/remote-loader';
import Highlight from './Highlight';

const ExampleDriverContext = createWithRemoteLoader({
    modules: ["components-core:Global@GlobalProvider"]
})(({remoteModules, children, ...props}) => {
    const [GlobalProvider] = remoteModules;
    return <HashRouter>
        <GlobalProvider {...props}>{children}</GlobalProvider>
    </HashRouter>
});

export const ExampleContent = createWithRemoteLoader({
    modules: ["components-core:Global@useGlobalContext", "components-core:Global@usePreset"]
})(({remoteModules, data}) => {
    const [useGlobalContext, usePreset] = remoteModules;
    const {global: global} = useGlobalContext();
    const preset = usePreset();

    const exampleStyle = get(data, 'example.style');
    const DriverContext = useMemo(() => {
        return ({children}) => <ExampleDriverContext {...global} preset={preset}>
            {children}
        </ExampleDriverContext>
    }, [global]);
    useEffect(() => {
        if (!exampleStyle) {
            return;
        }
        const dom = document.createElement('style');
        dom.innerText = exampleStyle.replace(/\n/g, '');
        document.head.append(dom);
        return () => {
            document.head.removeChild(dom);
        };
    }, [exampleStyle]);

    return <Space className={classnames('container', style['main'])} direction="vertical">
        {data.packageName && <>
            <h2 className={style['part-title']}>安装</h2>
            <Highlight className="mark-down-html"
                       html={`<pre><code class="language-shell hljs">npm install --save ${data.packageName}</code></pre>`}/>
        </>}
        {data.description && <>
            <h2 className={style['part-title']}>描述</h2>
            <Highlight className="mark-down-html" html={data.description}/>
        </>}
        <h2 className={style['part-title']}>概述</h2>
        <Highlight className="mark-down-html" html={data.summary}/>
        <h2 className={style['part-title']}>代码示例</h2>
        <div className={classnames(style['example'], data.example.className)}>
            <ExampleDriver contextComponent={DriverContext} isFull={data.example.isFull}
                           list={data.example.list}/>
        </div>
        <h2 className={style['part-title']}>API</h2>
        <Highlight className="mark-down-html" html={data.api}/>
    </Space>
});

const ExamplePage = createWithRemoteLoader({
    modules: ["components-core:Layout@Page", "components-core:Layout@Menu", "components-core:Global@useGlobalContext"]
})(({remoteModules, data, current, items, pageProps = {}}) => {
    const [Page, Menu] = remoteModules;
    return <Page title={data.name}
                 menu={items && items.length > 0 && <Menu currentKey={current} items={items}/>} {...pageProps}>
        <ExampleContent data={data}/>
    </Page>
});

export default ExamplePage;
