import { createBrowserRouter } from 'react-router-dom';
import Demo from './demo';
import React, { lazy } from 'react';
import PageSpinner from '~components/PageSpinner';

const Questions = lazy(() => import('./questions'));
const Editor = lazy(() => import('./editor'));
const Question = lazy(() => import('./question'));

export const enum RouterPath {
  question = '/question',
  questions = '/questions',
  editor = '/',
}

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
    path: RouterPath.question,
    element: (
      <React.Suspense fallback={<PageSpinner />}>
        <Question />
      </React.Suspense>
    ),
  },
  {
    path: RouterPath.questions,
    element: (
      <React.Suspense fallback={<PageSpinner />}>
        <Questions />
      </React.Suspense>
    ),
  },
  {
    path: '/demo',
    element: <Demo />,
  },
]);

export default router;
