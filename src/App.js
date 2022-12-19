import {useEffect} from "react";
import readme from "readme";
import get from "lodash/get";
import {Space} from "antd";
import style from "./app.module.scss";
import classnames from "classnames";
import ExampleDriver from "@kne/example-driver";
import {HashRouter, useParams} from "react-router-dom";
import RemoteLoader, {createWithRemoteLoader} from '@kne/remote-loader';

const ExampleDriverContext = ({children}) => {
    return <HashRouter>
        <RemoteLoader module="Global@GlobalProvider">{children}</RemoteLoader>
    </HashRouter>
};

const Example = createWithRemoteLoader({
    modules: ["Layout@Page", "Layout@Menu"]
})(({remoteModules}) => {
    const [Page, Menu] = remoteModules;
    const {id} = useParams();
    const current = id || Object.keys(readme)[0];
    const data = readme[current];
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
    return <Page title={data.name} menu={<Menu selectedKeys={[current]} items={Object.keys(readme).map((name) => {
        return {
            label: name, key: name, path: '/modules/' + name
        };
    })}/>}>
        <Space className="container" direction="vertical">
            <h2 className={style['part-title']}>概述</h2>
            <div className="mark-down-html" dangerouslySetInnerHTML={{__html: data.summary}}/>
            <h2 className={style['part-title']}>代码示例</h2>
            <div className={classnames(style['example'], data.example.className)}>
                <ExampleDriver contextComponent={ExampleDriverContext} isFull={data.example.isFull}
                               list={data.example.list}/>
            </div>
            <h2 className={style['part-title']}>API</h2>
            <div className="mark-down-html" dangerouslySetInnerHTML={{__html: data.api}}/>
        </Space>
    </Page>
});

export default Example;
