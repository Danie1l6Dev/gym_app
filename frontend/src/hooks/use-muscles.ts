import { useCallback, useEffect, useState } from 'react';

import { fetchMuscles } from '@/services';
import type { Muscle } from '@/interfaces/muscle';

export function useMuscles() {
  const [items, setItems] = useState<Muscle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchMuscles({ perPage: 10 });
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar los músculos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    loading,
    refreshing,
    error,
    refresh,
    retry,
  };
}
