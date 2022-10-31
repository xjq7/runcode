import { createBrowserRouter } from 'react-router-dom';
import Demo from './demo';
import React, { lazy } from 'react';
import GridLoader from 'react-spinners/GridLoader';

const Stat = lazy(() => import('./stats'));
const Editor = lazy(() => import('./editor'));

export const enum RouterPath {
  stat = '/stat',
  editor = '/',
}

const PageSpinner = () => {
  return (
    <div className="screen-full h-96 flex items-center justify-center">
      <GridLoader color="#570df8" size={25} />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: RouterPath.editor,
    element: (
      <React.Suspense fallback={<PageSpinner />}>
        <Editor />
      </React.Suspense>
    ),
  },
  {
    path: RouterPath.stat,
    element: (
      <React.Suspense fallback={<PageSpinner />}>
        <Stat />
      </React.Suspense>
    ),
  },
  {
    path: '/demo',
    element: <Demo />,
  },
]);

export default router;
