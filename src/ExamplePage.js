import '@kne/example-driver/dist/index.css';
import React, {useEffect} from "react";
import get from "lodash/get";
import {Space} from "antd";
import style from "./example.module.scss";
import classnames from "classnames";
import ExampleDriver from "@kne/example-driver";
import {HashRouter} from "react-router-dom";
import {createWithRemoteLoader} from '@kne/remote-loader';
import Highlight from './Highlight';

const ExampleDriverContext = createWithRemoteLoader({
    modules: ["components-core:Global@GlobalProvider", "components-core:Global@useGlobalContext"]
})(({remoteModules, children}) => {
    const [GlobalProvider, useGlobalContext] = remoteModules;
    const themeToken = useGlobalContext("themeToken");
    return <HashRouter>
        <GlobalProvider themeToken={themeToken}>{children}</GlobalProvider>
    </HashRouter>
});

const ExamplePage = createWithRemoteLoader({
    modules: ["components-core:Layout@Page", "components-core:Layout@Menu"]
})(({remoteModules, data, current, items, pageProps = {}}) => {
    const [Page, Menu] = remoteModules;

    const exampleStyle = get(data, 'example.style');
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
    return <Page {...pageProps} title={data.name} menu={<Menu currentKey={current} items={items}/>}>
        <Space className={classnames('container', style['main'])} direction="vertical">
            <h2 className={style['part-title']}>概述</h2>
            <Highlight className="mark-down-html" html={data.summary}/>
            <h2 className={style['part-title']}>代码示例</h2>
            <div className={classnames(style['example'], data.example.className)}>
                <ExampleDriver contextComponent={ExampleDriverContext} isFull={data.example.isFull}
                               list={data.example.list}/>
            </div>
            <h2 className={style['part-title']}>API</h2>
            <Highlight className="mark-down-html" html={data.api}/>
        </Space>
    </Page>
});

export default ExamplePage;
