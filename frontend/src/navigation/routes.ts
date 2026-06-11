import { ROUTES } from '@/constants';

export const NAVIGATION_ROUTES = ROUTES;

export const TAB_ITEMS = [
  { name: 'home', label: 'Inicio', href: ROUTES.app.home },
  { name: 'routines', label: 'Rutinas', href: ROUTES.app.routines },
  { name: 'explore', label: 'Explorar', href: ROUTES.app.explore },
  { name: 'profile', label: 'Perfil', href: ROUTES.app.profile },
] as const;

export const ADMIN_TAB_ITEMS = [
  { name: 'dashboard', label: 'Dashboard', href: ROUTES.app.adminDashboard },
  { name: 'users', label: 'Usuarios', href: ROUTES.app.adminUsers },
  { name: 'exercises', label: 'Ejercicios', href: ROUTES.app.adminExercises },
  { name: 'memberships', label: 'Membresías', href: ROUTES.app.adminMemberships },
  { name: 'manage', label: 'Administrar', href: ROUTES.app.adminManage },
] as const;
