import React from 'react';
import {useParams, Navigate} from "react-router-dom";
import ExamplePage from './ExamplePage';
import ensureSlash from '@kne/ensure-slash';

const Example = ({baseUrl, readme, pageProps}) => {
    const {id} = useParams();
    const current = id || Object.keys(readme)[0];
    const data = readme[current];

    if (!readme[current]) {
        return <Navigate to={`${ensureSlash(baseUrl, true)}${Object.keys(readme)[0]}`} replace/>
    }

    return <ExamplePage pageProps={pageProps} data={data} current={current} items={Object.keys(readme).map((name) => {
        return {
            label: name, key: name, path: `${ensureSlash(baseUrl, true)}` + name
        };
    })}/>
};

export default Example;
