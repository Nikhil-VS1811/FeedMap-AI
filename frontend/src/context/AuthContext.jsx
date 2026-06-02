/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setAuthToken } from '../api/axios';
import { getCurrentUser, loginUser, signupUser } from '../api/authApi';
import { clearAuthSession, getStoredToken, storeAuthSession, USER_STORAGE_KEY } from '../utils/authStorage';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    const hydrateUser = async () => {
      const token = getStoredToken();
      console.log('[auth hydrate] token from localStorage', token);

      if (!token) {
        setLoading(false);
        return;
      }

      setAuthToken(token);

      try {
        const { data } = await getCurrentUser();
        setUser(data.user);
        storeAuthSession({ token, user: data.user });
        console.log('[auth hydrate] user restored', data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const persistSession = (data) => {
    console.log('[auth persist] token from login/signup response', data.token);
    storeAuthSession(data);
    setAuthToken(data.token);
    setUser(data.user);
  };

  const login = useCallback(async (credentials) => {
    const { data } = await loginUser(credentials);
    persistSession(data);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await signupUser(payload);
    persistSession(data);
    return data.user;
  }, []);

  const logout = () => {
    clearAuthSession();
    setAuthToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      signup,
      user,
    }),
    [loading, login, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
