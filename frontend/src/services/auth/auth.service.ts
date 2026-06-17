import { Platform } from 'react-native';

import { API_BASE_URL } from '@/constants';
import { apiClient, type ApiError } from '@/services/api/client';
import type { LoginRequest, LoginResponse, UpdateProfilePayload, User } from '@/interfaces/auth';

type RawLoginResponse = {
  token?: string;
  access_token?: string;
  plainTextToken?: string;
  expires_at?: string | null;
  token_type?: string;
  tokenType?: string;
  user?: User;
  data?: {
    token?: string;
    access_token?: string;
    plainTextToken?: string;
    expires_at?: string | null;
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
  const user = payload.user ?? payload.data?.user ?? null;
  return user ? normalizeUserUrls(user) : null;
}

function normalizeUserUrls(user: User): User {
  // Si avatarUrl es una ruta relativa, completarla con la URL base
  if (user.avatarUrl && !user.avatarUrl.startsWith('http')) {
    user.avatarUrl = API_BASE_URL + user.avatarUrl;
  }
  
  return user;
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
    expiresAt: data.expires_at ?? data.data?.expires_at ?? null,
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

  return normalizeUserUrls(user);
}

export async function updateCurrentUserRequest(payload: UpdateProfilePayload): Promise<User> {
  const response = payload.profile_photo_file
    ? await apiClient.post<RawUserResponse>('/api/v1/auth/me', await createProfileFormData(payload))
    : await apiClient.put<RawUserResponse>('/api/v1/auth/me', payload);
  const user = response.data.user ?? response.data.data;

  if (!user) {
    throw new Error('Profile update response is missing user data.');
  }

  return normalizeUserUrls(user);
}

async function createProfileFormData(payload: UpdateProfilePayload) {
  const formData = new FormData();
  const photoFile = payload.profile_photo_file;

  formData.append('_method', 'PUT');

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'profile_photo_file' || value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });

  if (photoFile) {
    // Convertir el archivo a Blob con el tipo MIME correcto
    try {
      const response = await fetch(photoFile.uri);
      const arrayBuffer = await response.arrayBuffer();
      const photoBlob = new Blob([arrayBuffer], { type: photoFile.type });
      formData.append('profile_photo', photoBlob, photoFile.name);
    } catch (error) {
      console.error('Error converting photo to blob:', error);
      throw new Error('No se pudo procesar la imagen. Intenta nuevamente.');
    }
  }

  return formData;
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
