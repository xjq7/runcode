import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import rem from '~utils/rem';
import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import './userWorker';
import 'xterm/css/xterm.css';
import './tailwind.output.css';
import './main.css';

const config: ThemeConfig = {
  token: {
    colorPrimary: '#4338ca',
  },
};

rem();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider theme={config}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
