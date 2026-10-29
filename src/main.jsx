import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ApiConfigProvider } from './api/ApiConfigContext.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ApiConfigProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: { fontSize: '0.875rem' },
                }}
              />
            </AuthProvider>
          </QueryClientProvider>
        </ApiConfigProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
