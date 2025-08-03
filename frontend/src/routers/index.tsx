import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '../pages';
import CompanyResearch from '../pages/CompanyResearch';
import CompanyDashboard from '../pages/CompanyDashboard';
import Layout from './Layout';

// Define application routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/research" replace />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'research',
        element: <CompanyResearch />
      },
      {
        path: 'dashboard',
        element: <CompanyDashboard />
      },
      {
        path: '*',
        element: <Navigate to="/research" replace />
      }
    ]
  }
]);

export default router;
