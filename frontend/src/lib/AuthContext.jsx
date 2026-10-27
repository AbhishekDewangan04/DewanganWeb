import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

const LOCAL_MOCK_USER = {
  id: 'local-dev',
  name: 'Developer',
  email: 'dev@dewangan.web',
  role: 'developer',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(LOCAL_MOCK_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'dewangan-web',
    public_settings: { app_name: 'DewanganWeb' },
  });
  const [isIncognito, setIsIncognito] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('dew_incognito') === 'true';
    }
    return false;
  });

  const toggleIncognito = () => {
    setIsIncognito((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('dew_incognito', String(next));
        window.dispatchEvent(new CustomEvent('dew:incognito', { detail: next }));
      }
      return next;
    });
  };

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setAuthError(null);
      let publicSettings = null;
      try {
        publicSettings = await base44.app.getPublicSettings();
      } catch {
        publicSettings = { id: 'dewangan-web', public_settings: { app_name: 'DewanganWeb' } };
      }
      setAppPublicSettings(publicSettings);

      if (appParams.token) {
        await checkUserAuth();
      } else {
        setUser(LOCAL_MOCK_USER);
        setIsAuthenticated(true);
        setAuthChecked(true);
      }
    } catch (error) {
      console.warn('[AuthContext] Handled app state fallback:', error?.message || error);
      setUser(LOCAL_MOCK_USER);
      setIsAuthenticated(true);
      setAuthChecked(true);
      setAuthError(null);
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(LOCAL_MOCK_USER);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('[AuthContext] User auth fallback to local dev:', error?.message || error);
      setUser(LOCAL_MOCK_USER);
      setIsAuthenticated(true);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = false) => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      base44.auth.logout(shouldRedirect ? window.location.href : undefined);
    } catch {
      // ignore
    }
  };

  const navigateToLogin = () => {
    try {
      base44.auth.redirectToLogin(window.location.href);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
        isIncognito,
        toggleIncognito,
        setIsIncognito,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useIncognito = () => {
  const context = useContext(AuthContext);
  if (context) {
    return {
      isIncognito: context.isIncognito,
      toggleIncognito: context.toggleIncognito,
      setIsIncognito: context.setIsIncognito,
    };
  }
  return {
    isIncognito: typeof window !== 'undefined' && window.sessionStorage.getItem('dew_incognito') === 'true',
    toggleIncognito: () => {},
    setIsIncognito: () => {},
  };
};

export default AuthContext;
