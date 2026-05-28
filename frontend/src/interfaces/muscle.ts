import type { Exercise } from './exercise';

export interface Muscle {
  id: string | number;
  name_en?: string | null;
  name_es?: string | null;
  display_name?: string | null;
  slug?: string | null;
  exercises?: Exercise[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MuscleListResponse {
  items: Muscle[];
  message?: string;
  meta?: PaginationMeta | null;
  links?: PaginationLinks | null;
}

export interface PaginationMeta {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  links?: unknown[];
  path?: string;
  per_page?: number;
  to?: number | null;
  total?: number;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  next?: string | null;
  prev?: string | null;
}
