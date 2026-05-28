import { ROUTES } from '@/constants';
import type { TabItem } from '@/interfaces/navigation';

export const TAB_ITEMS: TabItem[] = [
  {
    name: 'home',
    label: 'Inicio',
    icon: 'I',
  },
  {
    name: 'routines',
    label: 'Rutinas',
    icon: 'R',
  },
  {
    name: 'explore',
    label: 'Explorar',
    icon: 'E',
  },
  {
    name: 'profile',
    label: 'Perfil',
    icon: 'P',
  },
];

export const TAB_ROUTES = {
  home: ROUTES.HOME,
  routines: ROUTES.ROUTINES,
  explore: ROUTES.EXPLORE,
  profile: ROUTES.PROFILE,
} as const;
