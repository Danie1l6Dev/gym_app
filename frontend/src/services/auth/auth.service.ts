import { apiClient, type ApiError } from '@/services/api/client';
import type { LoginRequest, LoginResponse, UpdateProfilePayload, User } from '@/interfaces/auth';

type RawLoginResponse = {
  token?: string;
  access_token?: string;
  plainTextToken?: string;
  token_type?: string;
  tokenType?: string;
  user?: User;
  data?: {
    token?: string;
    access_token?: string;
    plainTextToken?: string;
    token_type?: string;
    tokenType?: string;
    user?: User;
  };
  message?: string;
};

type RawUserResponse = {
  data?: User;
  user?: User;
  message?: string;
};

function resolveToken(payload: RawLoginResponse) {
  return (
    payload.token ??
    payload.access_token ??
    payload.plainTextToken ??
    payload.data?.token ??
    payload.data?.access_token ??
    payload.data?.plainTextToken ??
    ''
  );
}

function resolveUser(payload: RawLoginResponse) {
  return payload.user ?? payload.data?.user ?? null;
}

export async function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<RawLoginResponse>('/api/v1/auth/login', payload);
  const data = response.data;
  const token = resolveToken(data);
  const user = resolveUser(data);

  if (!token || !user) {
    throw new Error('Login response is missing token or user data.');
  }

  return {
    token,
    tokenType: data.token_type ?? data.tokenType ?? 'Bearer',
    user,
    message: data.message,
  };
}

export async function getCurrentUserRequest(): Promise<User> {
  const response = await apiClient.get<RawUserResponse>('/api/v1/auth/me');
  const user = response.data.user ?? response.data.data;

  if (!user) {
    throw new Error('Profile response is missing user data.');
  }

  return user;
}

export async function updateCurrentUserRequest(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.put<RawUserResponse>('/api/v1/auth/me', payload);
  const user = response.data.user ?? response.data.data;

  if (!user) {
    throw new Error('Profile update response is missing user data.');
  }

  return user;
}

export async function logoutRequest() {
  try {
    await apiClient.post('/api/v1/auth/logout');
  } catch (error) {
    if ((error as ApiError).status !== 401) {
      throw error;
    }
  }
}
