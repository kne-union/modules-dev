import '@kne/example-driver/dist/index.css';
import { preset as remoteLoaderPreset } from '@kne/remote-loader';

export const uiComponentsGlobal = {
    remote: 'ui_components',
    url: '/ui_components/remoteEntry.js'
};

remoteLoaderPreset(uiComponentsGlobal);