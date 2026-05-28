import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

const PROFILE_ITEMS = [
  { label: 'Membresía', value: 'Premium', detail: 'sin integrar todavía' },
  { label: 'Objetivo', value: 'Fuerza', detail: 'perfil editable luego' },
  { label: 'Preferencias', value: 'Oscuro', detail: 'tema base del producto' },
] as const;

export default function ProfileScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title="Perfil"
        subtitle="Zona de usuario y ajustes personales."
      />

      <EmptyState
        title="Perfil preparado"
        description="Más adelante aquí entrarán datos de usuario, membresía, progreso y ajustes."
        icon="account-outline"
      />

      <View style={styles.list}>
        {PROFILE_ITEMS.map((item) => (
          <View
            key={item.label}
            style={[
              styles.itemCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <TextBlock variant="caption" color="muted">
              {item.label}
            </TextBlock>
            <TextBlock variant="title">{item.value}</TextBlock>
            <TextBlock variant="caption" color="subtle">
              {item.detail}
            </TextBlock>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 16,
    gap: 12,
  },
  itemCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 6,
  },
});
