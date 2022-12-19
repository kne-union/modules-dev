import './preset';
import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {createWithRemoteLoader} from '@kne/remote-loader';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import readme from "readme";

const Entry = createWithRemoteLoader({
    modules: ["Global", "Layout"]
})(({remoteModules}) => {
    const [Global, Layout] = remoteModules;
    return <React.StrictMode>
        <Global>
            <BrowserRouter>
                <Routes>
                    <Route path="/modules/:id" element={<Layout><App/></Layout>}/>
                    <Route path='*' element={<Navigate to={`/modules/${Object.keys(readme)[0]}`}/>}/>
                </Routes>
            </BrowserRouter>
        </Global>
    </React.StrictMode>;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Entry/>);