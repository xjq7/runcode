import Toast from '~components/Toast';
import { RouterProvider } from 'react-router-dom';
import router from './pages/router';
import Layout from '~components/Layout';
import 'highlight.js/styles/rainbow.css';

function App() {
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
