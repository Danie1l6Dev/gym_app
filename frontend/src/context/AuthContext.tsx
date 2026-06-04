import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { API_BASE_URL } from '@/constants';
import type { AuthState, LoginRequest, UpdateProfilePayload, User } from '@/interfaces/auth';
import {
  clearAuthSession,
  getCurrentUserRequest,
  getStoredAuthSession,
  loginRequest,
  logoutRequest,
  saveAuthSession,
  updateCurrentUserRequest,
} from '@/services/auth';

type AuthContextValue = AuthState & {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
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

function normalizeUserAvatarUrl(user: User | null): User | null {
  if (!user || !user.avatarUrl) return user;
  
  // Si ya es una URL absoluta, dejarla tal cual
  if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
    return user;
  }
  
  // Si es una ruta relativa, completarla con la URL base
  return {
    ...user,
    avatarUrl: API_BASE_URL + user.avatarUrl,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    void refreshSession();
  }, []);

  async function refreshSession() {
    try {
      const session = await getStoredAuthSession();
      let user = normalizeUserAvatarUrl(session.user);

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

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updatedUser = await updateCurrentUserRequest(payload);

    await saveAuthSession({
      token: state.token,
      user: updatedUser,
    });

    setState((currentState) => ({
      ...currentState,
      user: updatedUser,
      isAuthenticated: Boolean(currentState.token && updatedUser),
    }));

    return updatedUser;
  }, [state.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshSession,
      updateProfile,
    }),
    [state, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
