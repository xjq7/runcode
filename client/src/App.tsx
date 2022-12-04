import Toast from '~components/Toast';
import { RouterProvider } from 'react-router-dom';
import router from './pages/router';
import Layout from '~components/Layout';
import { useEffect } from 'react';
import { visit } from '~services/stat';
import dayjs from 'dayjs';
import 'highlight.js/styles/rainbow.css';
import { parseReferrerToChannel } from '~utils/helper';

function App() {
  useEffect(() => {
    const channel = Number(
      parseReferrerToChannel() ||
        new URLSearchParams(location.search).get('channel') ||
        0
    );
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    visit({ createdAt: now, channel });
  }, []);

  return (
    <div className="bg-base-200 w-full h-full">
      <Toast />
      <Layout>
        <RouterProvider router={router} />
      </Layout>
    </div>
  );
}

export default App;
