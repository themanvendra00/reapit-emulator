import { createContext, useContext, useMemo, useState } from 'react';

// Hardcoded credentials for the emulator console. This gate is purely a
// front-end login screen for this admin tool — the emulator API itself
// does not require authentication.
const VALID_EMAIL = 'admin@soleshire.com';
const VALID_PASSWORD = 'Emulator@123';

const SESSION_KEY = 'emulatorAuthSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = (email, password) => {
    if (
      email.trim().toLowerCase() === VALID_EMAIL &&
      password === VALID_PASSWORD
    ) {
      const session = { email: VALID_EMAIL, loggedInAt: new Date().toISOString() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
