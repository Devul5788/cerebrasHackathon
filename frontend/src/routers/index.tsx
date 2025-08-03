import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '../pages';
import CompanyResearch from '../pages/company/CompanyResearch';
import CompanyDashboard from '../pages/company/CompanyDashboard';
import Layout from './Layout';
import ChatbotPage from '../pages/onboarding/chatbot/ChatbotPage';

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
      },      {
        path: 'research',
        element: <CompanyResearch />
      },
      {
        path: 'company',
        element: <CompanyDashboard />
      },
      {
        path: 'dashboard',
        element: <CompanyDashboard />
      },
      {
        path: 'chatbot',
        element: <ChatbotPage />
      },
      {
        path: '*',
        element: <Navigate to="/research" replace />
      }
    ]
  }
]);

export default router;
