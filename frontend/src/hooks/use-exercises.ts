import { useCallback, useEffect, useState } from 'react';

import type { Exercise, ExerciseFilters } from '@/interfaces/exercise';
import type { PaginationMeta } from '@/interfaces/muscle';
import { fetchExercises } from '@/services';

export function useExercises(filters: ExerciseFilters = {}) {
  const [items, setItems] = useState<Exercise[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchExercises({
        muscleId: filters.muscleId,
        search: filters.search,
        page: filters.page,
        perPage: filters.perPage ?? 10,
      });
      setItems(response.items);
      setMeta(response.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar los ejercicios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.muscleId, filters.page, filters.perPage, filters.search]);

  const refresh = useCallback(async () => {
    if (loading) {
      return;
    }

    setRefreshing(true);
    await load();
  }, [load, loading]);

  const retry = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return {
    items,
    meta,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  };
}
