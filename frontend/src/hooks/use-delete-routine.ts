import { useState } from 'react';

import { deleteRoutine } from '@/services';

export function useDeleteRoutine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(id: string | number) {
    try {
      setLoading(true);
      setError(null);
      await deleteRoutine(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos eliminar la rutina.';
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
