import { apiClient } from './api/client';
import { normalizeCollectionResponse, normalizeItemResponse } from './api/response';

import type { Muscle, MuscleListResponse } from '@/interfaces/muscle';

export interface MusclesQueryParams {
  search?: string;
  perPage?: number;
  page?: number;
}

type RawMuscleResponse = {
  data?: Muscle[];
  meta?: MuscleListResponse['meta'];
  links?: MuscleListResponse['links'];
  message?: string;
};

type RawMuscleItemResponse = {
  data?: Muscle;
  message?: string;
};

export async function fetchMuscles(params: MusclesQueryParams = {}): Promise<MuscleListResponse> {
  const response = await apiClient.get<RawMuscleResponse>('/api/v1/muscles', {
    params: {
      search: params.search,
      per_page: params.perPage,
      page: params.page,
    },
  });

  return normalizeCollectionResponse(response.data);
}

export async function fetchMuscleById(id: string | number) {
  const response = await apiClient.get<RawMuscleItemResponse>(`/api/v1/muscles/${id}`);
  return normalizeItemResponse(response.data);
}
