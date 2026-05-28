import { useState } from 'react';

import type { AdminUser, CreateUserPayload } from '@/interfaces/admin';
import { createAdminUser } from '@/services';

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: CreateUserPayload): Promise<AdminUser | null> {
    try {
      setLoading(true);
      setError(null);
      const response = await createAdminUser(payload);
      return response.item;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos crear el usuario.';
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
