import { AxiosError, create, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants';
import type { ApiErrorResponse } from '@/interfaces/auth';

import { clearAuthSession, getStoredToken } from '../auth/storage';

export interface ApiError extends Error {
  status?: number;
  data?: ApiErrorResponse;
  isApiError?: boolean;
}

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const url = config.url ?? '';

  if (url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/logout')) {
    return config;
  }

  const token = await getStoredToken();

  if (token) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Si el data es FormData, dejar que Axios maneje el Content-Type automáticamente
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const normalizedError = createApiError(error);

    if (normalizedError.status === 401) {
      await clearAuthSession();
    }

    return Promise.reject(normalizedError);
  }
);

function createApiError(error: AxiosError<ApiErrorResponse>): ApiError {
  const message =
    error.code === 'ECONNABORTED'
      ? 'La API tardó demasiado en responder. Revisa que `EXPO_PUBLIC_API_BASE_URL` apunte al backend correcto.'
      : error.response?.data?.message ||
        error.message ||
        'Ocurrió un error inesperado. Intenta nuevamente.';

  const apiError = new Error(message) as ApiError;
  apiError.name = 'ApiError';
  apiError.status = error.response?.status;
  apiError.data = error.response?.data;
  apiError.isApiError = true;

  return apiError;
}
