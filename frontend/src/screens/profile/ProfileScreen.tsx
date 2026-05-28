import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

const PROFILE_ITEMS = [
  { label: 'Membresía', value: 'Premium', detail: 'sin integrar todavía' },
  { label: 'Objetivo', value: 'Fuerza', detail: 'perfil editable luego' },
  { label: 'Preferencias', value: 'Oscuro', detail: 'tema base del producto' },
] as const;

export default function ProfileScreen() {
  const theme = useTheme();
  const { logout } = useAuth();

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

      <Pressable
        onPress={() => void logout()}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          pressed && styles.pressed,
        ]}>
        <TextBlock variant="button" color="primary">
          Cerrar sesión
        </TextBlock>
      </Pressable>
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
  logoutButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
