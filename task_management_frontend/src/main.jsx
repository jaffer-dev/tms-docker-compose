import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { setupInterceptor } from './utils/Interceptor.jsx';
import { store } from './store/index.jsx';

import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from  './MsalConfig.jsx';

const msalInstance = new PublicClientApplication(msalConfig);

setupInterceptor();
console.warn = () => { };

msalInstance.initialize().then(() => {
  createRoot(document.getElementById('root')).render(
    <MsalProvider instance={msalInstance}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </MsalProvider>
  );
});
