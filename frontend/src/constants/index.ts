export const API_BASE_URL = 'https://api.example.com';
export const API_TIMEOUT_MS = 15000;

export const STORAGE_KEYS = {
  authToken: '@gymapp/auth/token',
  authUser: '@gymapp/auth/user',
} as const;

export const ROUTES = {
  auth: {
    login: '/login',
  },
  app: {
    home: '/home',
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
