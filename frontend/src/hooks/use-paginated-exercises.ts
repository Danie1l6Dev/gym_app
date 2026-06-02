import { useCallback, useEffect, useState } from 'react';

import type { Exercise, ExerciseFilters, ExerciseListResponse } from '@/interfaces/exercise';
import { fetchExercises } from '@/services';

export function usePaginatedExercises(filters: ExerciseFilters = {}) {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [meta, setMeta] = useState<ExerciseListResponse['meta'] | null>(null);

  const perPage = filters.perPage ?? 25;

  const load = useCallback(
    async (nextPage: number, replace = false) => {
      try {
        setError(null);

        if (replace) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await fetchExercises({
          muscleId: filters.muscleId,
          search: filters.search,
          page: nextPage,
          perPage,
        });

        setItems((current) => (replace ? response.items : [...current, ...response.items]));
        setMeta(response.meta ?? null);
        setLastPage(response.meta?.last_page ?? nextPage);
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar los ejercicios.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [filters.muscleId, filters.search, perPage]
  );

  const refresh = useCallback(async () => {
    if (loading) {
      return;
    }

    setRefreshing(true);
    await load(1, true);
  }, [load, loading]);

  const retry = useCallback(async () => {
    setLoading(true);
    await load(1, true);
  }, [load]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || page >= lastPage) {
      return;
    }

    void load(page + 1, false);
  }, [lastPage, load, loading, loadingMore, page, refreshing]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load(1, true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return {
    items,
    loading,
    loadingMore,
    refreshing,
    error,
    meta,
    page,
    lastPage,
    hasMore: page < lastPage,
    refresh,
    retry,
    loadMore,
  };
}
