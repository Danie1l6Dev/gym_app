import { useCallback, useEffect, useState } from 'react';

import type { Routine } from '@/interfaces/routine';
import { fetchRoutines } from '@/services';

export function useRoutines() {
  const [items, setItems] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchRoutines();
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar las rutinas.');
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
