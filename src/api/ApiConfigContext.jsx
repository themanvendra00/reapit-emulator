import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'emulatorApiBaseUrl';

// In production (Vercel) the emulator only speaks plain HTTP, but the app is
// served over HTTPS — browsers block that as mixed content. `vercel.json`
// proxies `/api/*` server-side to the HTTP emulator, so the browser only
// ever talks to our own HTTPS origin. Locally there's no proxy, so talk to
// the emulator directly.
const DEFAULT_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3002';

function initialBaseUrl() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_BASE_URL;
  // Guard against a stale absolute http:// URL saved before this page was
  // served over https — that would hit the browser's mixed-content block.
  if (window.location.protocol === 'https:' && stored.startsWith('http://')) {
    return DEFAULT_BASE_URL;
  }
  return stored;
}

const ApiConfigContext = createContext(null);

export function ApiConfigProvider({ children }) {
  const [baseUrl, setBaseUrlState] = useState(initialBaseUrl);

  const setBaseUrl = (url) => {
    const clean = url.trim().replace(/\/$/, '');
    if (!clean) return;
    localStorage.setItem(STORAGE_KEY, clean);
    setBaseUrlState(clean);
  };

  const value = useMemo(
    () => ({ baseUrl, setBaseUrl, defaultBaseUrl: DEFAULT_BASE_URL }),
    [baseUrl],
  );

  return (
    <ApiConfigContext.Provider value={value}>
      {children}
    </ApiConfigContext.Provider>
  );
}

export function useApiConfig() {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error('useApiConfig must be used within ApiConfigProvider');
  return ctx;
}
