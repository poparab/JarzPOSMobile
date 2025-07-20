import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { axiosInstance } from '../api/axiosInstance';
import { API_BASE_URL, AUTH_METHOD, API_KEY, API_SECRET } from '@env';
// NOTE: We removed the native CookieManager dependency to avoid linking issues on Android.
// Session handling is done entirely inside Axios headers.

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  token: null,
  async login() {
    return false;
  },
  async logout() {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [token, setToken] = useState<string | null>(null);
  const isAuthenticated = !!token;

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync('authToken');
      if (stored) {
        setToken(stored);
        if (stored.includes(':')) {
          axiosInstance.defaults.headers.common.Authorization = `token ${stored}`;
        }
      }
    })();
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    if (AUTH_METHOD === 'apikey') {
      // if user supplied values use them otherwise fallback to env
      const key = email || API_KEY;
      const secret = password || API_SECRET;
      if (!key || !secret) return false;
      const tk = `${key}:${secret}`;
      axiosInstance.defaults.headers.common.Authorization = `token ${tk}`;
      await SecureStore.setItemAsync('authToken', tk);
      setToken(tk);
      return true;
    }
    try {
      const response = await axiosInstance.post(
        '/api/method/login',
        { usr: email, pwd: password },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const setCookie: string | undefined =
        (response as any).headers?.['set-cookie'] ??
        (response as any).headers?.['Set-Cookie'];
      if (setCookie) {
        // extract `sid` value
        const match = /sid=([^;]+)/.exec(setCookie);
        if (match) {
          const sid = match[1];
          await SecureStore.setItemAsync('authToken', sid);
          setToken(sid);
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }

  async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    delete axiosInstance.defaults.headers.common.Authorization;
    // nothing else to clear when using header-based cookies
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
