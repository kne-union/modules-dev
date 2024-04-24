import React from 'react';
import {preset as fetchPreset} from '@kne/react-fetch';
import {Spin, Empty, message} from 'antd';
import axios from 'axios';
import {preset as remoteLoaderPreset} from '@kne/remote-loader';
import omit from 'lodash/omit';
import monacoLoader from '@monaco-editor/loader';

window.PUBLIC_URL = process.env.PUBLIC_URL;

monacoLoader.config({
    paths: {
        vs: 'https://registry.npmmirror.com/monaco-editor/0.48.0/files/min/vs'
    }
});

const componentsCoreRemote = {
    remote: "components-core",
    url: "https://registry.npmmirror.com",
    tpl: "{{url}}/@kne-components%2f{{remote}}/{{version}}/files/build",
    defaultVersion: '0.1.10',
};

remoteLoaderPreset({
    remotes: {
        default: componentsCoreRemote, 'components-core': componentsCoreRemote, 'components-iconfont': {
            remote: "components-iconfont",
            url: "https://registry.npmmirror.com",
            tpl: "{{url}}/@kne-components%2f{{remote}}/{{version}}/files/build",
            defaultVersion: '0.1.3',
        }
    }
});

export const ajax = (() => {
    const instance = axios.create({
        validateStatus: function () {
            return true;
        }
    });

    return (params) => {
        if (params.hasOwnProperty('loader') && typeof params.loader === 'function') {
            return Promise.resolve(params.loader(omit(params, ['loader']))).then((data) => ({
                data: {
                    code: 0, data
                }
            })).catch((err) => {
                message.error(err.message || '请求发生错误');
                return {data: {code: 500, msg: err.message}};
            });
        }
        return instance(params);
    };
})();


fetchPreset({
    ajax,
    loading: <Spin delay={500}
                   style={{position: 'absolute', left: '50%', padding: '10px', transform: 'translateX(-50%)'}}/>,
    error: null,
    empty: <Empty/>,
    transformResponse: (response) => {
        const {data} = response;
        response.data = {
            code: data.code === 0 ? 200 : data.code, msg: data.msg, results: data.data
        };
        return response;
    }
});
