import { useCallback, useEffect, useState } from 'react';

import type { AdminDashboardData } from '@/interfaces/admin';
import { fetchAdminDashboard } from '@/services';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchAdminDashboard();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar el panel admin.');
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
    data,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  };
}
