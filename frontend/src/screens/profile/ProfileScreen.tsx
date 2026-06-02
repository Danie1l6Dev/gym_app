import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/dates';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const membership = user?.latest_membership;

  const profileItems = [
    { label: 'Correo', value: user?.email ?? 'No disponible', detail: 'dato de la cuenta' },
    { label: 'Rol', value: user?.role?.name ?? user?.role?.slug ?? 'Usuario', detail: 'permiso actual' },
    {
      label: 'Membresía',
      value: membership?.plan_label ?? 'Sin membresía activa',
      detail: membership?.ends_at ? `vence el ${formatShortDate(membership.ends_at)}` : 'sin vencimiento registrado',
    },
  ] as const;

  return (
    <ScreenContainer>
      <AppHeader
        title={user?.name ?? 'Perfil'}
        subtitle="Datos de la sesión autenticada."
      />

      {!user ? (
        <EmptyState
          title="Sin datos de usuario"
          description="Inicia sesión nuevamente para cargar el perfil."
          icon="account-alert-outline"
        />
      ) : null}

      <View style={styles.list}>
        {profileItems.map((item) => (
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
