import Toast from '~components/Toast';
import { RouterProvider } from 'react-router-dom';
import router from './pages/router';
import Layout from '~components/Layout';
import { useEffect } from 'react';
import { visit } from '~services/stat';
import dayjs from 'dayjs';

function App() {
  useEffect(() => {
    const now = dayjs().format('YYYY-MM-DD HH:ss:mm');
    visit({ createdAt: now });
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
