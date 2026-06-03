import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AuthState, LoginRequest } from '@/interfaces/auth';
import {
  clearAuthSession,
  getCurrentUserRequest,
  getStoredAuthSession,
  loginRequest,
  logoutRequest,
  saveAuthSession,
} from '@/services/auth';

type AuthContextValue = AuthState & {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    void refreshSession();
  }, []);

  async function refreshSession() {
    try {
      const session = await getStoredAuthSession();
      let user = session.user;

      if (session.token) {
        user = await getCurrentUserRequest();

        await saveAuthSession({
          token: session.token,
          user,
        });
      }

      setState({
        user,
        token: session.token,
        loading: false,
        isAuthenticated: Boolean(session.token && user),
      });
    } catch {
      setState({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  }

  async function login(credentials: LoginRequest) {
    const response = await loginRequest(credentials);

    await saveAuthSession({
      token: response.token,
      user: response.user,
    });

    setState({
      user: response.user,
      token: response.token,
      loading: false,
      isAuthenticated: true,
    });
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      await clearAuthSession();

      setState({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshSession,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
