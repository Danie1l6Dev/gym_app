import { apiClient } from './api/client';
import { normalizeCollectionResponse, normalizeItemResponse } from './api/response';

import type {
  AdminDashboardData,
  AdminMembership,
  AdminMembershipsQuery,
  AdminUser,
  AdminUsersQuery,
  CreateUserPayload,
} from '@/interfaces/admin';
import type { MembershipType, MembershipTypePayload } from '@/interfaces/membership-type';

type Paginated<T> = {
  data?: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    total?: number;
  } | null;
  links?: {
    next?: string | null;
    prev?: string | null;
  } | null;
  message?: string;
};

type Single<T> = {
  data?: T;
  message?: string;
};

type ExerciseSyncSummary = {
  created?: number;
  updated?: number;
  omitted?: number;
  total?: number;
  errors?: string[];
};

function normalizeUserResponse(payload: Paginated<AdminUser>) {
  return normalizeCollectionResponse(payload);
}

function normalizeMembershipResponse(payload: Paginated<AdminMembership>) {
  return normalizeCollectionResponse(payload);
}

async function fetchAdminUsersPage(query: AdminUsersQuery = {}) {
  const response = await apiClient.get<Paginated<AdminUser>>('/api/v1/admin/users', {
    params: {
      search: query.search,
      page: query.page,
      per_page: query.perPage,
      role: query.role,
    },
  });

  return normalizeUserResponse(response.data);
}

async function fetchAdminMembershipsPage(query: AdminMembershipsQuery = {}) {
  const response = await apiClient.get<Paginated<AdminMembership>>('/api/v1/admin/memberships', {
    params: {
      page: query.page,
      per_page: query.perPage,
    },
  });

  return normalizeMembershipResponse(response.data);
}

async function fetchUpcomingMembershipsPage(query: AdminMembershipsQuery = {}) {
  const response = await apiClient.get<Paginated<AdminMembership>>(
    '/api/v1/admin/memberships/upcoming',
    {
      params: {
        days: query.days,
        page: query.page,
        per_page: query.perPage,
      },
    }
  );

  return normalizeMembershipResponse(response.data);
}

export async function fetchAdminUsers(query: AdminUsersQuery = {}) {
  return fetchAdminUsersPage(query);
}

export async function fetchAdminUserById(id: string | number) {
  const response = await apiClient.get<Single<AdminUser>>(`/api/v1/admin/users/${id}`);
  return normalizeItemResponse(response.data);
}

export async function createAdminUser(payload: CreateUserPayload) {
  const response = await apiClient.post<Single<AdminUser>>('/api/v1/admin/users', payload);
  return normalizeItemResponse(response.data);
}

export async function updateAdminUser(id: string | number, payload: Partial<CreateUserPayload>) {
  const response = await apiClient.put<Single<AdminUser>>(`/api/v1/admin/users/${id}`, payload);
  return normalizeItemResponse(response.data);
}

export async function fetchAdminMemberships(query: AdminMembershipsQuery = {}) {
  return fetchAdminMembershipsPage(query);
}

export async function fetchExpiringMemberships(query: AdminMembershipsQuery = {}) {
  return fetchUpcomingMembershipsPage(query);
}

export async function fetchMembershipTypes() {
  const response = await apiClient.get<Paginated<MembershipType>>('/api/v1/admin/membership-types');
  return normalizeCollectionResponse(response.data);
}

export async function fetchMembershipTypeById(id: string | number) {
  const response = await apiClient.get<Single<MembershipType>>(`/api/v1/admin/membership-types/${id}`);
  return normalizeItemResponse(response.data);
}

export async function createMembershipType(payload: MembershipTypePayload) {
  const response = await apiClient.post<Single<MembershipType>>('/api/v1/admin/membership-types', payload);
  return normalizeItemResponse(response.data);
}

export async function updateMembershipType(id: string | number, payload: MembershipTypePayload) {
  const response = await apiClient.put<Single<MembershipType>>(`/api/v1/admin/membership-types/${id}`, payload);
  return normalizeItemResponse(response.data);
}

export async function deleteMembershipType(id: string | number) {
  const response = await apiClient.delete<Single<MembershipType>>(`/api/v1/admin/membership-types/${id}`);
  return normalizeItemResponse(response.data);
}

export async function syncAdminExercises(token?: string | null) {
  const response = await apiClient.post<Single<ExerciseSyncSummary>>('/api/v1/admin/exercises/sync', null, {
    timeout: 300000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const [usersPage, membershipsPages, expiringPage] = await Promise.all([
    fetchAdminUsersPage({ perPage: 10 }),
    fetchAllMemberships(),
    fetchUpcomingMembershipsPage({ perPage: 10, days: 30 }),
  ]);

  const activeMemberships = membershipsPages.items.filter((membership) => membership.status === 'active').length;

  return {
    stats: {
      totalUsers: usersPage.meta?.total ?? usersPage.items.length,
      activeMemberships,
      expiringMemberships: expiringPage.meta?.total ?? expiringPage.items.length,
    },
    expiringMemberships: expiringPage.items,
    recentMembers: usersPage.items.slice(0, 5),
  };
}

async function fetchAllMemberships() {
  const firstPage = await fetchAdminMembershipsPage({ perPage: 10, page: 1 });
  const lastPage = firstPage.meta?.last_page ?? 1;

  if (lastPage <= 1) {
    return firstPage;
  }

  const pages = [firstPage.items];

  for (let page = 2; page <= lastPage; page += 1) {
    const response = await fetchAdminMembershipsPage({ perPage: 10, page });
    pages.push(response.items);
  }

  return {
    ...firstPage,
    items: pages.flat(),
  };
}

// Delete operations
export async function deleteAdminUser(id: string | number) {
  const response = await apiClient.delete<Single<AdminUser>>(`/api/v1/admin/users/${id}`);
  return normalizeItemResponse(response.data);
}

export async function deleteAdminMembership(id: string | number) {
  const response = await apiClient.delete<Single<AdminMembership>>(`/api/v1/admin/memberships/${id}`);
  return normalizeItemResponse(response.data);
}

export async function deleteExercise(id: string | number) {
  const response = await apiClient.delete('/api/v1/exercises/' + id);
  return normalizeItemResponse(response.data);
}

export async function deleteRoutine(id: string | number) {
  const response = await apiClient.delete('/api/v1/routines/' + id);
  return normalizeItemResponse(response.data);
}

// Create operations
export async function createMembership(payload: any) {
  const response = await apiClient.post<Single<AdminMembership>>('/api/v1/admin/memberships', payload);
  return normalizeItemResponse(response.data);
}

export async function updateMembership(id: string | number, payload: any) {
  const response = await apiClient.put<Single<AdminMembership>>(`/api/v1/admin/memberships/${id}`, payload);
  return normalizeItemResponse(response.data);
}

export async function createExercise(payload: any) {
  const response = await apiClient.post('/api/v1/exercises', payload);
  return normalizeItemResponse(response.data);
}

export async function updateExercise(id: string | number, payload: any) {
  const response = await apiClient.put('/api/v1/exercises/' + id, payload);
  return normalizeItemResponse(response.data);
}

export async function createRoutine(payload: any) {
  const response = await apiClient.post('/api/v1/routines', payload);
  return normalizeItemResponse(response.data);
}

export async function updateRoutine(id: string | number, payload: any) {
  const response = await apiClient.put('/api/v1/routines/' + id, payload);
  return normalizeItemResponse(response.data);
}
