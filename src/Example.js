import React from 'react';
import {useParams, Navigate} from "react-router-dom";
import ExamplePage from './ExamplePage';
import ensureSlash from '@kne/ensure-slash';
import Fetch from '@kne/react-fetch';

const Example = ({baseUrl, readme, pageProps}) => {
    const {id: current} = useParams();
    const data = readme[current];

    if (!readme[current]) {
        return <Navigate to={`${ensureSlash(baseUrl, true)}${Object.keys(readme)[0]}`} replace/>
    }

    const renderExamplePage = ({data}) => <ExamplePage pageProps={pageProps} data={data} current={current}
                                                       items={Object.keys(readme).map((name) => {
                                                           return {
                                                               label: name,
                                                               key: name,
                                                               path: `${ensureSlash(baseUrl, true)}` + name
                                                           };
                                                       })}/>

    if (data && data.hasOwnProperty('loader') || data.hasOwnProperty('url')) {
        return <Fetch {...Object.assign({}, data)} render={renderExamplePage}/>
    }

    return renderExamplePage({data});
};

export default Example;
