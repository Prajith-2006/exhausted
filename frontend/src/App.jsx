import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <AppRouter />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
