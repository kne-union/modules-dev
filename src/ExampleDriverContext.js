import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {ResponsiveProvider} from '@kne/responsive-utils';
import {createWithRemoteLoader} from '@kne/remote-loader';

/**
 * ExampleDriver contextComponent wrapper (GlobalProvider + router).
 * `enableResponsiveProvider` defaults to false — @kne/example-driver LiveCode
 * injects ResponsiveProvider with device-preview container mode since 0.1.24+.
 */
const ExampleDriverContext = createWithRemoteLoader({
    modules: ['components-core:Global@GlobalProvider']
})(({remoteModules, children, enableResponsiveProvider = false, ...props}) => {
    const [GlobalProvider] = remoteModules;
    const tree = (
        <MemoryRouter>
            <GlobalProvider {...props}>{children}</GlobalProvider>
        </MemoryRouter>
    );
    if (enableResponsiveProvider) {
        return <ResponsiveProvider>{tree}</ResponsiveProvider>;
    }
    return tree;
});

export default ExampleDriverContext;
