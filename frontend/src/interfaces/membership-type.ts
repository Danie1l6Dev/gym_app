export interface MembershipType {
  id: string | number;
  name: string;
  code: string;
  duration_days: number;
  price: string | number;
  description?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MembershipTypePayload {
  name: string;
  code: string;
  duration_days: number;
  price: number;
  description?: string | null;
  is_active?: boolean;
}
