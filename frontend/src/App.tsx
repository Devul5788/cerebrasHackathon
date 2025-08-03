import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routers';
import { ThemeProvider } from './contexts';
import './assets/App.css';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
