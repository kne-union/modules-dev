import React from 'react';
import {useParams} from "react-router-dom";
import ExamplePage from './ExamplePage';

const Example = ({readme}) => {
    const {id} = useParams();
    const current = id || Object.keys(readme)[0];
    const data = readme[current];
    return <ExamplePage data={data} current={current} items={Object.keys(readme).map((name) => {
        return {
            label: name, key: name, path: '/modules-dev/' + name
        };
    })}/>
};

export default Example;
