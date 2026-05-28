import { useCallback, useEffect, useState } from 'react';

import type { Routine } from '@/interfaces/routine';
import { fetchRoutineById } from '@/services';

export function useRoutine(id?: string) {
  const [item, setItem] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('No se encontró la rutina solicitada.');
      setItem(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const response = await fetchRoutineById(id);
      setItem(response.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar la rutina.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

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
    item,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  };
}
