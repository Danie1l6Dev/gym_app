import { useState } from 'react';

import type { RoutinePayload } from '@/interfaces/routine';
import { updateRoutine } from '@/services';

export function useUpdateRoutine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(id: string | number, payload: Partial<RoutinePayload>) {
    try {
      setLoading(true);
      setError(null);
      return await updateRoutine(id, payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos actualizar la rutina.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    submit,
  };
}
