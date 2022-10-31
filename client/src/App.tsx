import Toast from '~components/Toast';
import { RouterProvider } from 'react-router-dom';
import router from './pages/router';
import Layout from '~components/Layout';
import { useEffect } from 'react';
import { visit } from '~services/stat';

function App() {
  useEffect(() => {
    visit();
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
