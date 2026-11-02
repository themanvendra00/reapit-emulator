import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ApiConfigProvider } from './api/ApiConfigContext.jsx';
import { ThemeProvider, useTheme } from './theme/ThemeContext.jsx';
import { Toaster } from './components/ui/sonner.jsx';
import { TooltipProvider } from './components/ui/tooltip.jsx';
import './index.css';

function AppToaster(props) {
  const { dark } = useTheme();
  return <Toaster theme={dark ? 'dark' : 'light'} {...props} />;
}

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
              <TooltipProvider delayDuration={200}>
                <App />
              </TooltipProvider>
              <AppToaster
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
