import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import rem from '~utils/rem';
import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import './userWorker';
import 'xterm/css/xterm.css';
import './tailwind.output.css';
import './main.css';
import { Lang } from '~store/config/editor';
import i18nLangJson from './lang.json';

const config: ThemeConfig = {
  token: {
    colorPrimary: '#4338ca',
  },
};

rem();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: i18nLangJson,
    lng: Lang.EN, // if you're using a language detector, do not define the lng option
    fallbackLng: Lang.EN,

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider theme={config}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
