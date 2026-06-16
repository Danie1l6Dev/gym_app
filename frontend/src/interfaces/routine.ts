import type { Exercise } from './exercise';
import type { PaginationLinks, PaginationMeta } from './muscle';

export interface RoutineExercise {
  exercise_id: string | number;
  position: number;
  sets?: number | null;
  reps?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  exercise?: Exercise | null;
}

export interface RoutineDay {
  id: string | number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Routine {
  id: string | number;
  user_id?: string | number | null;
  name: string;
  description?: string | null;
  is_predefined?: boolean;
  user?: {
    id?: string | number;
    name?: string | null;
    email?: string | null;
  } | null;
  days?: RoutineDay[];
  exercises?: Exercise[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RoutineInputExercise {
  exercise_id: string | number;
  position: number;
  sets?: number | null;
  reps?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
}

export interface RoutinePayload {
  name: string;
  description?: string | null;
  is_predefined?: boolean;
  days?: (string | number)[];
  exercises?: RoutineInputExercise[];
}

export interface RoutineListResponse {
  items: Routine[];
  meta?: PaginationMeta | null;
  links?: PaginationLinks | null;
  message?: string;
}
