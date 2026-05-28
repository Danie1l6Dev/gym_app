import { ROUTES } from '@/constants';

export const NAVIGATION_ROUTES = ROUTES;

export const TAB_ITEMS = [
  { name: 'home', label: 'Inicio', href: ROUTES.app.home },
  { name: 'routines', label: 'Rutinas', href: ROUTES.app.routines },
  { name: 'explore', label: 'Explorar', href: ROUTES.app.explore },
  { name: 'profile', label: 'Perfil', href: ROUTES.app.profile },
] as const;
