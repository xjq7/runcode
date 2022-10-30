import { createBrowserRouter } from 'react-router-dom';
import Editor from './editor';
import Stat from './stats';
import Demo from './demo';

export const enum RouterPath {
  stat = '/stat',
  editor = '/',
}

const router = createBrowserRouter([
  {
    path: RouterPath.editor,
    element: <Editor />,
  },
  {
    path: RouterPath.stat,
    element: <Stat />,
  },
  {
    path: '/demo',
    element: <Demo />,
  },
]);

export default router;
