import { useCallback, useEffect, useMemo, useState } from 'react';

import type { WeeklyProgress, WeeklyProgressPayload } from '@/interfaces/weekly-progress';
import { fetchAdminUserWeeklyProgress, fetchWeeklyProgress, updateWeeklyProgress } from '@/services';

type WeeklyProgressOptions = {
  userId?: string | number | null;
  admin?: boolean;
};

export function useWeeklyProgress(options: WeeklyProgressOptions = {}) {
  const [item, setItem] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoad = useMemo(
    () => !options.admin || options.userId !== null && options.userId !== undefined && options.userId !== '',
    [options.admin, options.userId],
  );

  const load = useCallback(async () => {
    if (!canLoad) {
      setItem(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const response = options.admin && options.userId
        ? await fetchAdminUserWeeklyProgress(options.userId)
        : await fetchWeeklyProgress();
      setItem(response.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar el progreso semanal.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canLoad, options.admin, options.userId]);

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

  const submit = useCallback(async (payload: WeeklyProgressPayload) => {
    setUpdating(true);

    try {
      setError(null);
      const response = await updateWeeklyProgress(payload);
      setItem(response.item);
      return response.item;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos actualizar el progreso semanal.';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

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
    updating,
    error,
    refresh,
    retry,
    submit,
  };
}
