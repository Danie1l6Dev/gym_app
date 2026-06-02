import type { Membership } from './membership';
import type { User } from './auth';

export interface AdminUser extends User {
  username?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  height?: string | number | null;
  weight?: string | number | null;
  profile_photo?: string | null;
  is_active?: boolean;
  latest_membership?: Membership | null;
  memberships?: Membership[] | null;
}

export interface AdminMembership extends Membership {
  user?: AdminUser | null;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeMemberships: number;
  expiringMemberships: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  expiringMemberships: AdminMembership[];
  recentMembers: AdminUser[];
}

export interface AdminRoleOption {
  value: 'admin' | 'user';
  label: string;
}

export interface CreateUserPayload {
  role_id?: number | null;
  role_slug?: 'admin' | 'user' | null;
  name: string;
  username?: string | null;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  profile_photo?: string | null;
  is_active?: boolean;
  membership_plan_type?: 'weekly' | 'monthly' | null;
  membership_ends_at?: string | null;
  membership_notes?: string | null;
}

export interface AdminUsersQuery {
  search?: string;
  page?: number;
  perPage?: number;
  role?: 'user' | 'admin';
}

export interface AdminMembershipsQuery {
  page?: number;
  perPage?: number;
  days?: number;
}
