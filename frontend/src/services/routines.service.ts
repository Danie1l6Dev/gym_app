import { apiClient } from './api/client';
import { normalizeCollectionResponse, normalizeItemResponse } from './api/response';

import type { Routine, RoutineListResponse, RoutinePayload } from '@/interfaces/routine';

type RawRoutineResponse = {
  data?: Routine[];
  meta?: RoutineListResponse['meta'];
  links?: RoutineListResponse['links'];
  message?: string;
};

type RawRoutineItemResponse = {
  data?: Routine;
  message?: string;
};

export async function fetchRoutines(): Promise<RoutineListResponse> {
  const response = await apiClient.get<RawRoutineResponse>('/api/v1/routines', {
    params: {
      per_page: 10,
    },
  });

  return normalizeCollectionResponse(response.data);
}

export async function fetchRoutineById(id: string | number) {
  const response = await apiClient.get<RawRoutineItemResponse>(`/api/v1/routines/${id}`);
  return normalizeItemResponse(response.data);
}

export async function createRoutine(payload: RoutinePayload) {
  const response = await apiClient.post<RawRoutineItemResponse>('/api/v1/routines', payload);
  return normalizeItemResponse(response.data);
}

export async function updateRoutine(id: string | number, payload: Partial<RoutinePayload>) {
  const response = await apiClient.put<RawRoutineItemResponse>(`/api/v1/routines/${id}`, payload);
  return normalizeItemResponse(response.data);
}

export async function deleteRoutine(id: string | number) {
  await apiClient.delete(`/api/v1/routines/${id}`);
}
