import { apiClient } from './api/client';
import { normalizeItemResponse } from './api/response';

import type { WeeklyProgress, WeeklyProgressPayload } from '@/interfaces/weekly-progress';

type RawWeeklyProgressResponse = {
  data?: WeeklyProgress;
  message?: string;
};

export async function fetchWeeklyProgress() {
  const response = await apiClient.get<RawWeeklyProgressResponse>('/api/v1/weekly-progress');
  return normalizeItemResponse(response.data);
}

export async function updateWeeklyProgress(payload: WeeklyProgressPayload) {
  const response = await apiClient.put<RawWeeklyProgressResponse>('/api/v1/weekly-progress', payload);
  return normalizeItemResponse(response.data);
}

export async function fetchAdminUserWeeklyProgress(id: string | number) {
  const response = await apiClient.get<RawWeeklyProgressResponse>(`/api/v1/admin/users/${id}/weekly-progress`);
  return normalizeItemResponse(response.data);
}
