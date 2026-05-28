import { useState } from 'react';

import type { RoutinePayload } from '@/interfaces/routine';
import { createRoutine } from '@/services';

export function useCreateRoutine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: RoutinePayload) {
    try {
      setLoading(true);
      setError(null);
      return await createRoutine(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos crear la rutina.';
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
