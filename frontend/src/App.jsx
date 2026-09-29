import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import AppRouter from './router/AppRouter';
import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <AppRouter />
          <ChatBot />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
