import type { PaginationLinks, PaginationMeta, Muscle } from './muscle';

export interface Exercise {
  id: string | number;
  muscle_id?: string | number | null;
  source?: string | null;
  external_id?: string | number | null;
  name_en?: string | null;
  name_es?: string | null;
  display_name?: string | null;
  description_en?: string | null;
  description_es?: string | null;
  display_description?: string | null;
  gif_url?: string | null;
  difficulty?: string | number | null;
  difficulty_label?: string | null;
  muscle?: Muscle | null;
  pivot?: {
    position?: number | null;
    sets?: number | null;
    reps?: number | null;
    rest_seconds?: number | null;
    notes?: string | null;
  } | null;
  synced_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ExerciseListResponse {
  items: Exercise[];
  message?: string;
  meta?: PaginationMeta | null;
  links?: PaginationLinks | null;
}

export interface ExerciseFilters {
  muscleId?: string | number;
  search?: string;
  page?: number;
  perPage?: number;
}
