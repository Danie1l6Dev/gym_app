import { useCallback, useEffect, useState } from 'react';

import type { Exercise, ExerciseFilters, ExerciseListResponse } from '@/interfaces/exercise';
import { fetchExercises } from '@/services';

type UsePaginatedExercisesOptions = ExerciseFilters & {
  keepPreviousPages?: boolean;
};

export function usePaginatedExercises(filters: UsePaginatedExercisesOptions = {}) {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [meta, setMeta] = useState<ExerciseListResponse['meta'] | null>(null);

  const perPage = filters.perPage ?? 10;
  const keepPreviousPages = filters.keepPreviousPages ?? true;

  const load = useCallback(
    async (nextPage: number, mode: 'initial' | 'refresh' | 'retry' | 'page' | 'append' = 'initial') => {
      try {
        setError(null);

        if (mode === 'initial' || mode === 'retry') {
          setLoading(true);
        } else if (mode === 'refresh') {
          setRefreshing(true);
        } else if (mode === 'page') {
          setLoadingPage(true);
        } else {
          setLoadingMore(true);
        }

        const response = await fetchExercises({
          muscleId: filters.muscleId,
          search: filters.search,
          page: nextPage,
          perPage,
        });

        setItems((current) => {
          if (mode !== 'append' || !keepPreviousPages) {
            return response.items;
          }

          return [...current, ...response.items];
        });
        setMeta(response.meta ?? null);
        setLastPage(response.meta?.last_page ?? nextPage);
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar los ejercicios.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setLoadingPage(false);
        setRefreshing(false);
      }
    },
    [filters.muscleId, filters.search, keepPreviousPages, perPage]
  );

  const refresh = useCallback(async () => {
    if (loading || loadingMore || loadingPage || refreshing) {
      return;
    }

    await load(1, 'refresh');
  }, [load, loading, loadingMore, loadingPage, refreshing]);

  const retry = useCallback(async () => {
    await load(1, 'retry');
  }, [load]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || page >= lastPage) {
      return;
    }

    void load(page + 1, 'append');
  }, [lastPage, load, loading, loadingMore, page, refreshing]);

  const goToPage = useCallback(
    async (nextPage: number) => {
      if (
        nextPage < 1 ||
        nextPage > lastPage ||
        nextPage === page ||
        loading ||
        loadingMore ||
        loadingPage ||
        refreshing
      ) {
        return;
      }

      await load(nextPage, 'page');
    },
    [lastPage, load, loading, loadingMore, loadingPage, page, refreshing]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load(1, 'initial');
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return {
    items,
    loading,
    loadingMore,
    loadingPage,
    refreshing,
    error,
    meta,
    page,
    lastPage,
    hasMore: page < lastPage,
    refresh,
    retry,
    loadMore,
    goToPage,
  };
}
