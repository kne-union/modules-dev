import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {createWithRemoteLoader} from '@kne/remote-loader';

/** ExampleDriver contextComponent wrapper (GlobalProvider + router). ResponsiveProvider is injected by @kne/example-driver LiveCode. */
const ExampleDriverContext = createWithRemoteLoader({
    modules: ['components-core:Global@GlobalProvider']
})(({remoteModules, children, ...props}) => {
    const [GlobalProvider] = remoteModules;
    return (
        <MemoryRouter>
            <GlobalProvider {...props}>{children}</GlobalProvider>
        </MemoryRouter>
    );
});

export default ExampleDriverContext;
