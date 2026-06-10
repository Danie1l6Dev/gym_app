import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAdminUser } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Membership } from '@/interfaces/membership';
import { formatShortDate } from '@/utils/dates';

type UserParams = {
  id?: string;
};

type DetailItem = {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
};

function formatOptional(value?: string | number | null, fallback = 'Sin registrar') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
}

function formatMeasurement(value?: string | number | null, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return 'Sin registrar';
  }

  return `${value}${suffix}`;
}

function formatPrice(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return 'Sin registrar';
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function resolvePlanLabel(membership?: Membership | null) {
  return membership?.plan_label ?? membership?.plan_type ?? 'Sin membresia';
}

function DetailGrid({ items }: { items: DetailItem[] }) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[
            styles.infoItem,
            { backgroundColor: theme.colors.surfaceElevated },
          ]}
        >
          <MaterialCommunityIcons name={item.icon} size={18} color={theme.colors.textSubtle} />
          <View style={styles.infoText}>
            <TextBlock variant="caption" color="subtle">
              {item.label}
            </TextBlock>
            <TextBlock variant="caption" color="muted" numberOfLines={2}>
              {item.value}
            </TextBlock>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function UserDetailScreen() {
  const theme = useTheme();
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
  const genderLabel = item.gender ? GENDER_LABELS[item.gender] ?? item.gender : 'Sin registrar';
  const memberships = item.memberships ?? [];

  const accountItems: DetailItem[] = [
    { icon: 'identifier', label: 'ID', value: String(item.id) },
    { icon: 'account-key-outline', label: 'Rol', value: item.role?.name ?? item.role?.slug ?? 'Usuario' },
    { icon: 'email-outline', label: 'Correo', value: item.email },
    { icon: 'account-outline', label: 'Username', value: item.username ? `@${item.username}` : 'Sin registrar' },
    {
      icon: item.is_active === false ? 'close-circle-outline' : 'check-circle-outline',
      label: 'Estado',
      value: item.is_active === false ? 'Inactivo' : 'Activo',
    },
    { icon: 'clock-outline', label: 'Creado', value: formatShortDate(item.created_at ?? null) },
  ];

  const personalItems: DetailItem[] = [
    { icon: 'phone-outline', label: 'Telefono', value: formatOptional(item.phone) },
    { icon: 'calendar-account-outline', label: 'Nacimiento', value: formatShortDate(item.birth_date ?? null) },
    { icon: 'gender-male-female', label: 'Genero', value: genderLabel },
    { icon: 'human-male-height', label: 'Estatura', value: formatMeasurement(item.height, ' cm') },
    { icon: 'weight-kilogram', label: 'Peso', value: formatMeasurement(item.weight, ' kg') },
    { icon: 'image-outline', label: 'Foto de perfil', value: formatOptional(item.profile_photo) },
  ];

  const membershipItems: DetailItem[] = [
    { icon: 'credit-card-outline', label: 'Plan', value: resolvePlanLabel(membership) },
    { icon: 'progress-check', label: 'Estado', value: membership?.status ?? 'Sin membresia' },
    { icon: 'calendar-start', label: 'Inicio', value: formatShortDate(membership?.starts_at ?? null) },
    { icon: 'calendar-end', label: 'Vence', value: formatShortDate(membership?.ends_at ?? null) },
    { icon: 'cash', label: 'Precio', value: formatPrice(membership?.price) },
    { icon: 'calendar-check-outline', label: 'Pago', value: formatShortDate(membership?.paid_at ?? null) },
    { icon: 'note-text-outline', label: 'Notas', value: formatOptional(membership?.notes) },
  ];

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title={item.name} subtitle={item.email} showBack />

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextBlock variant="eyebrow" color="primary">
            Cuenta
          </TextBlock>
          <TextBlock variant="header">{item.name}</TextBlock>
          <DetailGrid items={accountItems} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextBlock variant="title">Informacion personal</TextBlock>
          <DetailGrid items={personalItems} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextBlock variant="title">Membresia actual</TextBlock>
          <DetailGrid items={membershipItems} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextBlock variant="title">Historial de membresias</TextBlock>
          {memberships.length > 0 ? (
            <View style={styles.historyList}>
              {memberships.map((historyItem) => (
                <View
                  key={String(historyItem.id)}
                  style={[
                    styles.historyItem,
                    { backgroundColor: theme.colors.surfaceElevated },
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <TextBlock variant="body">{resolvePlanLabel(historyItem)}</TextBlock>
                    <TextBlock variant="caption" color="primary">
                      {historyItem.status ?? 'Sin estado'}
                    </TextBlock>
                  </View>
                  <TextBlock variant="caption" color="muted">
                    {formatShortDate(historyItem.starts_at ?? null)} - {formatShortDate(historyItem.ends_at ?? null)}
                  </TextBlock>
                  <TextBlock variant="caption" color="subtle">
                    {formatPrice(historyItem.price)}
                  </TextBlock>
                </View>
              ))}
            </View>
          ) : (
            <TextBlock variant="body" color="muted">
              Este usuario no tiene membresias registradas.
            </TextBlock>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: DIMENSIONS.tabBarHeight,
    gap: 12,
  },
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    minWidth: 160,
    flexGrow: 1,
    flexBasis: '31%',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
