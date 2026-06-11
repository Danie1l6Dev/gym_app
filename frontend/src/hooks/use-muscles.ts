import { useCallback, useEffect, useState } from 'react';

import type { Muscle, PaginationMeta } from '@/interfaces/muscle';
import { fetchMuscles } from '@/services';

type UseMusclesFilters = {
  perPage?: number;
  page?: number;
};

export function useMuscles(filters: UseMusclesFilters = {}) {
  const [items, setItems] = useState<Muscle[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(filters.page ?? 1);
  const [lastPage, setLastPage] = useState(1);

  const perPage = filters.perPage ?? 10;
  const initialPage = filters.page ?? 1;

  const load = useCallback(
    async (nextPage = 1, mode: 'initial' | 'refresh' | 'retry' | 'page' = 'initial') => {
      try {
        setError(null);

        if (mode === 'page') {
          setLoadingPage(true);
        } else if (mode === 'refresh') {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetchMuscles({ page: nextPage, perPage });

        setItems(response.items);
        setMeta(response.meta ?? null);
        setPage(nextPage);
        setLastPage(response.meta?.last_page ?? nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar los musculos.');
      } finally {
        setLoading(false);
        setLoadingPage(false);
        setRefreshing(false);
      }
    },
    [perPage]
  );

  const refresh = useCallback(async () => {
    if (loading || loadingPage || refreshing) {
      return;
    }

    await load(1, 'refresh');
  }, [load, loading, loadingPage, refreshing]);

  const retry = useCallback(async () => {
    await load(1, 'retry');
  }, [load]);

  const goToPage = useCallback(
    async (nextPage: number) => {
      if (nextPage < 1 || nextPage > lastPage || nextPage === page || loading || loadingPage || refreshing) {
        return;
      }

      await load(nextPage, 'page');
    },
    [lastPage, load, loading, loadingPage, page, refreshing]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load(initialPage, 'initial');
    }, 0);

    return () => clearTimeout(timeout);
  }, [initialPage, load]);

  return {
    items,
    meta,
    loading,
    loadingPage,
    refreshing,
    error,
    page,
    lastPage,
    refresh,
    retry,
    goToPage,
  };
}
