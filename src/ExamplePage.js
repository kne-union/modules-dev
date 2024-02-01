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
})(({remoteModules, themeToken, children}) => {
    const [GlobalProvider] = remoteModules;
    return <HashRouter>
        <GlobalProvider themeToken={themeToken}>{children}</GlobalProvider>
    </HashRouter>
});

export const ExampleContent = createWithRemoteLoader({
    modules: ["components-core:Global@useGlobalContext"]
})(({remoteModules, data}) => {
    const [useGlobalContext] = remoteModules;
    const {global: themeToken} = useGlobalContext("themeToken");

    const exampleStyle = get(data, 'example.style');
    const DriverContext = useMemo(() => {
        return (props) => <ExampleDriverContext {...props} themeToken={themeToken}/>
    }, [themeToken]);
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
    return <Page {...pageProps} title={data.name}
                 menu={items && items.length > 0 && <Menu currentKey={current} items={items}/>}>
        <ExampleContent data={data}/>
    </Page>
});

export default ExamplePage;
