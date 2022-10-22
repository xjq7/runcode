import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './userWorker';
import './tailwind.output.css';
import rem from '~utils/rem';

rem();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
