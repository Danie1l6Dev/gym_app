import { useCallback, useEffect, useState } from 'react';

import type { MembershipType } from '@/interfaces/membership-type';
import { fetchMembershipTypes } from '@/services/admin.service';

export function useMembershipTypes() {
  const [items, setItems] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchMembershipTypes();
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar los tipos de membresia.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  const retry = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => {
    void load();
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
