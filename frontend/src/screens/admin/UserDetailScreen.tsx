import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAdminUser, useMembershipTypes, useWeeklyProgress } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { WeeklyProgress } from '@/interfaces/weekly-progress';
import type { Membership } from '@/interfaces/membership';
import type { MembershipType } from '@/interfaces/membership-type';
import { createMembership } from '@/services/admin.service';
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

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createEndDate(durationDays?: number | null): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(Number(durationDays ?? 0), 0));

  return formatDateInput(date);
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

function WeeklyProgressSummary({
  progress,
  loading,
  error,
}: {
  progress: WeeklyProgress | null;
  loading: boolean;
  error: string | null;
}) {
  const theme = useTheme();
  const days = progress?.days ?? [];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.sectionHeader}>
        <View>
          <TextBlock variant="title">Progreso semanal</TextBlock>
          <TextBlock variant="caption" color="muted">
            {loading && !progress
              ? 'Cargando asistencia de la semana'
              : error ?? progress?.status_label ?? 'Sin registros'}
          </TextBlock>
        </View>
        <View style={[styles.progressBadge, { backgroundColor: theme.colors.surfaceElevated }]}>
          <TextBlock variant="title" color="primary">
            {progress?.percentage ?? 0}%
          </TextBlock>
          <TextBlock variant="caption" color="subtle">
            {progress ? `${progress.completed_target_days}/${progress.target_days}` : '0/0'}
          </TextBlock>
        </View>
      </View>

      <View style={[styles.adminProgressTrack, { backgroundColor: theme.colors.surfaceElevated }]}>
        <View style={[styles.adminProgressFill, { width: `${progress?.percentage ?? 0}%` }]} />
      </View>

      <View style={styles.adminWeekList}>
        {days.map((day) => (
          <View
            key={day.date}
            style={[
              styles.adminWeekDay,
              { backgroundColor: theme.colors.surfaceElevated },
              day.completed && styles.adminWeekDayDone,
            ]}
          >
            <View style={styles.adminWeekDayTop}>
              <TextBlock variant="caption" color={day.completed ? 'primary' : 'muted'}>
                {day.label.slice(0, 3)}
              </TextBlock>
              <MaterialCommunityIcons
                name={day.completed ? 'check-circle' : day.is_scheduled ? 'calendar-clock' : 'minus-circle-outline'}
                size={16}
                color={day.completed ? theme.colors.primary : theme.colors.textSubtle}
              />
            </View>
            <TextBlock variant="caption" color="subtle" numberOfLines={2}>
              {day.is_scheduled ? day.routines.map((routine) => routine.name).join(', ') : 'Descanso'}
            </TextBlock>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function UserDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<UserParams>();
  const { item, loading, error, retry, refresh } = useAdminUser(id);
  const weeklyProgress = useWeeklyProgress({ admin: true, userId: id });
  const membershipTypes = useMembershipTypes();
  const [renewingPlan, setRenewingPlan] = useState<string | null>(null);

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
  const activeMembershipTypes = membershipTypes.items.filter((membershipType) => membershipType.is_active);
  const canRenewMembership = item.role?.slug !== 'admin';

  async function handleRenewMembership(membershipType: MembershipType) {
    if (renewingPlan || !item) {
      return;
    }

    const startsAt = formatDateInput(new Date());
    const endsAt = createEndDate(membershipType.duration_days);
    const userId = item.id;

    async function renew() {
      try {
        setRenewingPlan(membershipType.code);
        await createMembership({
          user_id: userId,
          plan_type: membershipType.code,
          starts_at: startsAt,
          ends_at: endsAt,
          status: 'active',
          price: Number(membershipType.price),
          notes: `Renovacion registrada desde el perfil del usuario. Vence ${endsAt}.`,
        });
        await refresh();
      } catch (err) {
        Alert.alert(
          'No pudimos renovar',
          err instanceof Error ? err.message : 'Intenta nuevamente.'
        );
      } finally {
        setRenewingPlan(null);
      }
    }

    Alert.alert(
      'Renovar membresia',
      `Se activara ${membershipType.name} desde hoy hasta ${endsAt}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Renovar', onPress: () => void renew() },
      ]
    );
  }

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

          {canRenewMembership ? (
            <View style={[styles.renewBox, { backgroundColor: theme.colors.surfaceElevated }]}>
              <View style={styles.renewHeader}>
                <View style={styles.renewCopy}>
                  <TextBlock variant="title">Renovar y reactivar</TextBlock>
                  <TextBlock variant="caption" color="muted">
                    Crea una membresia pagada desde hoy. Si la cuenta estaba inactiva, se reactiva automaticamente.
                  </TextBlock>
                </View>
                {membershipTypes.loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
              </View>

              <View style={styles.renewActions}>
                {activeMembershipTypes.map((membershipType) => (
                  <Pressable
                    key={membershipType.id}
                    disabled={Boolean(renewingPlan)}
                    onPress={() => void handleRenewMembership(membershipType)}
                    style={({ pressed }) => [
                      styles.renewButton,
                      {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      pressed && styles.pressed,
                      renewingPlan && styles.disabled,
                    ]}>
                    {renewingPlan === membershipType.code ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="credit-card-check-outline" size={16} color="#fff" />
                        <TextBlock variant="button" style={styles.renewButtonText}>
                          {membershipType.name}
                        </TextBlock>
                      </>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <WeeklyProgressSummary
          progress={weeklyProgress.item}
          loading={weeklyProgress.loading}
          error={weeklyProgress.error}
        />

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
  renewBox: {
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  renewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  renewCopy: {
    flex: 1,
    gap: 4,
  },
  renewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  renewButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  renewButtonText: {
    color: '#fff',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.66,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  progressBadge: {
    minWidth: 92,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  adminProgressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  adminProgressFill: {
    height: '100%',
    minWidth: 2,
    borderRadius: 999,
    backgroundColor: '#7c3aed',
  },
  adminWeekList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adminWeekDay: {
    flexGrow: 1,
    flexBasis: 128,
    minWidth: 118,
    minHeight: 82,
    borderRadius: 14,
    padding: 10,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  adminWeekDayDone: {
    borderColor: 'rgba(124,58,237,0.34)',
  },
  adminWeekDayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
