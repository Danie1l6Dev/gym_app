import type { Membership } from './membership';

export interface User {
  id: string | number;
  name: string;
  email: string;
  username?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  height?: string | number | null;
  weight?: string | number | null;
  is_active?: boolean;
  latest_membership?: Membership | null;
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
