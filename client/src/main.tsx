import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import rem from '~utils/rem';
import './userWorker';
import 'xterm/css/xterm.css';
import './tailwind.output.css';
import Reporter, { Browser } from '@mtrjs/sdk';

const reporter = new Reporter({
  env: 'prod',
  dsn: 'https://mtr-api.xjq.icu',
  appId: '6be4bd000f6ad238',
  plugins: [new Browser()],
});

reporter.init();
rem();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
