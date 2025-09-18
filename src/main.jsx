import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './i18n.js';
// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap JS (optional)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AlertProvider} from '../src/context/AlertContext.jsx';
import Alert from '../src/context/Alert.jsx';
import {UserProvider} from './context/Profile.jsx';
import {LikesProvider} from './context/LikesContext.jsx';
import {SPProfileProvider} from './context/SPProfileContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AlertProvider>
            <UserProvider>
                <SPProfileProvider>
                    <LikesProvider>
                        <App />
                        <Alert /> 
                    </LikesProvider>
                </SPProfileProvider>
            </UserProvider>
        </AlertProvider>
    </React.StrictMode>,
);