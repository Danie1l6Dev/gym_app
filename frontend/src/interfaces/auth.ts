import type { Membership } from './membership';
import type { Routine } from './routine';

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
  profile_photo?: string | null;
  is_active?: boolean;
  latest_membership?: Membership | null;
  routines?: Routine[];
  role?: {
    id?: string | number;
    name?: string;
    slug?: string;
    description?: string | null;
  } | null;
  avatarUrl?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string | null;
  email?: string;
  phone?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other';
  height?: string | number | null;
  weight?: string | number | null;
  profile_photo?: string | null;
  profile_photo_file?: {
    uri: string;
    name: string;
    type: string;
  };
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
