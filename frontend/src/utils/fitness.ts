import type { Exercise } from '@/interfaces/exercise';
import type { Muscle } from '@/interfaces/muscle';

export function getMuscleDisplayName(muscle: Muscle) {
  return muscle.display_name ?? muscle.name_es ?? muscle.name_en ?? 'Músculo';
}

export function getMuscleSubtext(muscle: Muscle) {
  const parts = [muscle.name_es, muscle.name_en].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : muscle.slug ?? '';
}

export function getExerciseDisplayName(exercise: Exercise) {
  return exercise.display_name ?? exercise.name_es ?? exercise.name_en ?? 'Ejercicio';
}

export function getExerciseDescription(exercise: Exercise) {
  return exercise.display_description ?? exercise.description_es ?? exercise.description_en ?? '';
}

export function getExerciseDifficulty(exercise: Exercise) {
  return exercise.difficulty_label ?? (exercise.difficulty !== null && exercise.difficulty !== undefined ? String(exercise.difficulty) : '');
}
