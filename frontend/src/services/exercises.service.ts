import { apiClient } from './api/client';
import { normalizeCollectionResponse, normalizeItemResponse } from './api/response';

import type { Exercise, ExerciseFilters, ExerciseListResponse } from '@/interfaces/exercise';

type RawExerciseResponse = {
  data?: Exercise[];
  meta?: ExerciseListResponse['meta'];
  links?: ExerciseListResponse['links'];
  message?: string;
};

type RawExerciseItemResponse = {
  data?: Exercise;
  message?: string;
};

export async function fetchExercises(filters: ExerciseFilters = {}): Promise<ExerciseListResponse> {
  const response = await apiClient.get<RawExerciseResponse>('/api/v1/exercises', {
    params: {
      muscle_id: filters.muscleId,
      search: filters.search,
      page: filters.page,
      per_page: filters.perPage,
      has_gif: filters.hasGif,
    },
  });

  return normalizeCollectionResponse(response.data);
}

export async function fetchExerciseById(id: string | number) {
  const response = await apiClient.get<RawExerciseItemResponse>(`/api/v1/exercises/${id}`);
  return normalizeItemResponse(response.data);
}
