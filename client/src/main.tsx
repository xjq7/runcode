import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import rem from '~utils/rem';
import './userWorker';
import './tailwind.output.css';

rem();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
