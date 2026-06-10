const DEFAULT_API_BASE_URL = 'http://localhost:8000';

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, '');
}

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl || DEFAULT_API_BASE_URL);
export const API_TIMEOUT_MS = 15000;

export const STORAGE_KEYS = {
  authToken: '@gymapp/auth/token',
  authUser: '@gymapp/auth/user',
} as const;

export const ADMIN_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
] as const;

export const MEMBERSHIP_PLAN_OPTIONS = [
  { value: 'weekly', label: 'Semanal', price: 35000 },
  { value: 'monthly', label: 'Mensual', price: 120000 },
] as const;

export const DEFAULT_EXPIRING_WINDOW_DAYS = 30;

export const ROUTES = {
  auth: {
    login: '/login',
  },
  app: {
    home: '/home',
    adminDashboard: '/admin/dashboard',
    adminUsers: '/admin/users',
    adminUserCreate: '/admin/users/new',
    adminUserDetail: '/admin/users/[id]',
    adminExercises: '/admin/exercises',
    adminMemberships: '/admin/memberships',
    adminExpiringMemberships: '/admin/expiring',
    adminManage: '/admin/manage',
    adminManageMemberships: '/admin/manage/memberships',
    adminManageMembershipCreate: '/admin/manage/memberships/new',
    adminManageMembershipDetail: '/admin/manage/memberships/[id]',
    adminManageUsers: '/admin/manage/users',
    adminManageUserCreate: '/admin/manage/users/new',
    adminManageUserDetail: '/admin/manage/users/[id]',
    adminManageExercises: '/admin/manage/exercises',
    adminManageRoutines: '/admin/manage/routines',
    routines: '/routines',
    routineCreate: '/routines/new',
    routineDetail: '/routines/[id]',
    explore: '/explore',
    profile: '/profile',
    muscles: '/muscles',
    exercises: '/exercises',
    exerciseDetail: '/exercises/[id]',
  },
} as const;

export const DIMENSIONS = {
  contentMaxWidth: 1120,
  mobileContentMaxWidth: 720,
  screenPadding: 24,
  cardRadius: 24,
  chipRadius: 999,
  headerHeight: 72,
  tabBarHeight: 84,
  bottomInset: 24,
  touchTarget: 48,
} as const;
