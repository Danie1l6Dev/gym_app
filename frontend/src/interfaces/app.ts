export type AppRoute =
  | '/login'
  | '/home'
  | '/routines'
  | '/explore'
  | '/profile'
  | '/muscles'
  | '/exercises'
  | '/admin/muscles'
  | '/admin/catalog/exercises';

export interface MuscleSummary {
  id: string;
  name: string;
  description?: string;
  accentColor?: string;
}

export interface ExerciseSummary {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: string;
}

export interface RoutineSummary {
  id: string;
  name: string;
  goal?: string;
}
