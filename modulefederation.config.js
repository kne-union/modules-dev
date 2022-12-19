const path = require('path');
const {dependencies} = require(path.resolve(process.cwd(), 'package.json'));

const sharedList = {};

Object.keys(dependencies).map((name) => {
    sharedList[name] = {
        eager: true,
        requiredVersion: dependencies[name]
    };
});

module.exports = {
    name: 'modules-dev',
    shared: {
        ...sharedList,
        react: {
            singleton: true,
            requiredVersion: dependencies['react'],
            eager: true
        },
        'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
            eager: true
        },
        'react-router-dom': {
            singleton: true,
            requiredVersion: dependencies['react-router-dom'],
            eager: true
        },
        'antd': {
            singleton: true,
            requiredVersion: dependencies['antd'],
            eager: true
        },
        'classnames': {
            singleton: true,
            requiredVersion: dependencies['classnames'],
            eager: true
        },
        axios: {
            eager: true,
            singleton: true,
            requiredVersion: dependencies['axios'],
        },
        '@kne/react-fetch': {
            eager: true,
            singleton: true,
            requiredVersion: dependencies['@kne/react-fetch']
        },
        '@kne/remote-loader': {
            eager: true,
            singleton: true,
            requiredVersion: dependencies['@kne/remote-loader']
        },
        '@ant-design/icons':{
            eager: true,
            singleton: true,
            requiredVersion: dependencies['@ant-design/icons']
        }
    },
}
