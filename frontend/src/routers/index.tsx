import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '../pages';
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
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'chatbot',
        element: <ChatbotPage />
      },
      {
        path: '*',
        element: <Navigate to="/home" replace />
      }
    ]
  }
]);

export default router;
