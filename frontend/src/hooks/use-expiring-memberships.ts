import { useCallback, useEffect, useState } from 'react';

import type { AdminMembership } from '@/interfaces/admin';
import { fetchExpiringMemberships } from '@/services';

export function useExpiringMemberships(days = 30, perPage = 15) {
  const [items, setItems] = useState<AdminMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(
    async (nextPage: number, replace = false) => {
      try {
        setError(null);
        const response = await fetchExpiringMemberships({
          days,
          page: nextPage,
          perPage,
        });

        setItems((current) => (replace ? response.items : [...current, ...response.items]));
        setLastPage(response.meta?.last_page ?? nextPage);
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No pudimos cargar los vencimientos.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [days, perPage]
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
    if (loading || refreshing || page >= lastPage) {
      return;
    }

    void load(page + 1, false);
  }, [lastPage, load, loading, page, refreshing]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setItems([]);
      void load(1, true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return {
    items,
    loading,
    refreshing,
    error,
    page,
    lastPage,
    hasMore: page < lastPage,
    refresh,
    retry,
    loadMore,
  };
}
