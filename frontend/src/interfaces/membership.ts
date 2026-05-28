import type { User } from './auth';

export interface Membership {
  id: string | number;
  user_id?: string | number | null;
  plan_name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  status?: string | null;
  price?: string | number | null;
  notes?: string | null;
  user?: User | null;
  created_at?: string | null;
  updated_at?: string | null;
}
