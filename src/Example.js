import React, {useLayoutEffect} from 'react';
import {useParams, Navigate, useSearchParams} from "react-router-dom";
import ExamplePage from './ExamplePage';
import ensureSlash from '@kne/ensure-slash';
import Fetch from '@kne/react-fetch';
import {createWithRemoteLoader} from '@kne/remote-loader';

const ScrollToTop = createWithRemoteLoader({
    modules: ['components-core:Global@useScrollElement']
})(({remoteModules, watch}) => {
    const [useScrollElement] = remoteModules;
    const getScrollElement = useScrollElement();

    useLayoutEffect(() => {
        const scrollEl = getScrollElement();
        if (scrollEl) {
            scrollEl.scrollTo(0, 0);
        }
        // body 上存在 overflow: auto !important 时，实际滚动可能在 document
        window.scrollTo(0, 0);
    }, [watch, getScrollElement]);

    return null;
});

const Example = ({baseUrl, readme, pageProps}) => {
    const {id: current} = useParams();
    const [searchParams] = useSearchParams();
    const searchString = searchParams.size > 0 ? '?' + searchParams.toString() : '';
    const data = readme[current];

    if (!(current && readme[current])) {
        return <Navigate to={`${ensureSlash(baseUrl, true)}${Object.keys(readme)[0]}${searchString}`} replace/>
    }

    const renderExamplePage = ({data}) => <ExamplePage pageProps={pageProps} data={data} current={current}
                                                       items={Object.keys(readme).map((name) => {
                                                           return {
                                                               label: name,
                                                               key: name,
                                                               path: `${ensureSlash(baseUrl, true)}` + name + searchString
                                                           };
                                                       })}/>

    return <>
        <ScrollToTop watch={current} remoteFallback={null}/>
        {(data && data.hasOwnProperty('loader') || data.hasOwnProperty('url')) ?
            <Fetch {...Object.assign({}, data)} render={renderExamplePage}/> :
            renderExamplePage({data})}
    </>;
};

export default Example;
