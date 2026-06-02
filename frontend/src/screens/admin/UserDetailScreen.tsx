import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAdminUser } from '@/hooks';
import { formatShortDate } from '@/utils/dates';

type UserParams = {
  id?: string;
};

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<UserParams>();
  const { item, loading, error, retry } = useAdminUser(id);

  if (loading && !item) {
    return (
      <ScreenContainer>
        <AppHeader title="Usuario" subtitle="Detalle de cuenta" showBack />
        <LoadingSpinner label="Cargando usuario" />
      </ScreenContainer>
    );
  }

  if (error || !item) {
    return (
      <ScreenContainer>
        <AppHeader title="Usuario" subtitle="Detalle de cuenta" showBack />
        <EmptyState
          title="No pudimos cargar el usuario"
          description={error ?? 'No encontramos la cuenta solicitada.'}
          icon="alert-circle-outline"
          actionLabel="Reintentar"
          onAction={retry}
        />
      </ScreenContainer>
    );
  }

  const membership = item.latest_membership;

  return (
    <ScreenContainer>
      <AppHeader title={item.name} subtitle={item.email} showBack />

      <View style={styles.card}>
        <TextBlock variant="eyebrow" color="primary">
          Profile
        </TextBlock>
        <TextBlock variant="header">{item.username ? `@${item.username}` : item.name}</TextBlock>
        <TextBlock variant="body" color="muted">
          {item.role?.slug ?? 'user'} · {item.is_active === false ? 'Inactivo' : 'Activo'}
        </TextBlock>
      </View>

      <View style={styles.card}>
        <TextBlock variant="title">Membresía</TextBlock>
        <View style={styles.row}>
          <TextBlock variant="caption" color="muted">
            Plan
          </TextBlock>
          <TextBlock variant="caption">{membership?.plan_label ?? 'Sin membresía'}</TextBlock>
        </View>
        <View style={styles.row}>
          <TextBlock variant="caption" color="muted">
            Estado
          </TextBlock>
          <TextBlock variant="caption">{membership?.status ?? 'Pendiente'}</TextBlock>
        </View>
        <View style={styles.row}>
          <TextBlock variant="caption" color="muted">
            Vence
          </TextBlock>
          <TextBlock variant="caption">{formatShortDate(membership?.ends_at ?? null)}</TextBlock>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 10,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
