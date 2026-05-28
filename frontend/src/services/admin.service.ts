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

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const [usersPage, membershipsPages, expiringPage] = await Promise.all([
    fetchAdminUsersPage({ perPage: 1 }),
    fetchAllMemberships(),
    fetchUpcomingMembershipsPage({ perPage: 100, days: 30 }),
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
  const firstPage = await fetchAdminMembershipsPage({ perPage: 100, page: 1 });
  const lastPage = firstPage.meta?.last_page ?? 1;

  if (lastPage <= 1) {
    return firstPage;
  }

  const pages = [firstPage.items];

  for (let page = 2; page <= lastPage; page += 1) {
    const response = await fetchAdminMembershipsPage({ perPage: 100, page });
    pages.push(response.items);
  }

  return {
    ...firstPage,
    items: pages.flat(),
  };
}
