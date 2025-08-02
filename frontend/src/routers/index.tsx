import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '../pages';
import Layout from './Layout';

// Define application routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: '*',
        element: <Navigate to="/home" replace />
      }
    ]
  }
]);

export default router;
