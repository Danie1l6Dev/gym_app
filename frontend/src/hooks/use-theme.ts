import { createAppTheme } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  return createAppTheme(useColorScheme());
}
