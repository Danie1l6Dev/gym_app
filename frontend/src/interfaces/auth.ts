export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: {
    id?: string | number;
    name?: string;
    slug?: string;
    description?: string | null;
  } | null;
  avatarUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType?: string;
  user: User;
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface StoredAuthSession {
  user: User | null;
  token: string | null;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
