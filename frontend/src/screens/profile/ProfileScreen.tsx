import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/dates';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type ProfileItem = {
  label: string;
  value: string;
  icon: IconName;
  detail?: string;
};

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const membership = user?.latest_membership;
  const routines = user?.routines ?? [];
  const avatarUri = user?.avatarUrl ?? user?.profile_photo ?? null;
  const initials = getInitials(user?.name);
  const roleLabel = user?.role?.name ?? user?.role?.slug ?? 'Usuario';
  const accountStatus = user?.is_active === false ? 'Cuenta inactiva' : 'Cuenta activa';
  const bmi = calculateBmi(user?.height, user?.weight);

  const accountItems: ProfileItem[] = [
    { label: 'Usuario', value: user?.username ?? 'No registrado', icon: 'account-outline' },
    { label: 'Correo', value: user?.email ?? 'No disponible', icon: 'email-outline' },
    { label: 'Teléfono', value: user?.phone ?? 'No registrado', icon: 'phone-outline' },
    { label: 'Rol', value: roleLabel, icon: 'shield-account-outline' },
    {
      label: 'Estado',
      value: user?.is_active === false ? 'Inactivo' : 'Activo',
      icon: user?.is_active === false ? 'account-off-outline' : 'account-check-outline',
    },
  ];

  const physicalItems: ProfileItem[] = [
    {
      label: 'Fecha de nacimiento',
      value: user?.birth_date ? formatShortDate(user.birth_date) : 'No registrada',
      icon: 'calendar-account-outline',
    },
    { label: 'Edad', value: calculateAge(user?.birth_date) ?? 'No disponible', icon: 'calendar-clock' },
    { label: 'Género', value: formatGender(user?.gender), icon: 'human-male-female' },
    { label: 'Altura', value: formatMeasurement(user?.height, 'm'), icon: 'human-male-height' },
    { label: 'Peso', value: formatMeasurement(user?.weight, 'kg'), icon: 'weight-kilogram' },
    { label: 'IMC', value: bmi ?? 'No disponible', icon: 'calculator-variant-outline' },
  ];

  const membershipItems: ProfileItem[] = [
    { label: 'Plan', value: membership?.plan_label ?? 'Sin membresía', icon: 'card-account-details-outline' },
    { label: 'Estado', value: formatMembershipStatus(membership?.status), icon: 'check-decagram-outline' },
    {
      label: 'Inicio',
      value: membership?.starts_at ? formatShortDate(membership.starts_at) : 'No registrado',
      icon: 'calendar-start-outline',
    },
    {
      label: 'Vencimiento',
      value: membership?.ends_at ? formatShortDate(membership.ends_at) : 'No registrado',
      icon: 'calendar-end-outline',
    },
    { label: 'Precio', value: formatCurrency(membership?.price), icon: 'cash' },
    {
      label: 'Fecha de pago',
      value: membership?.paid_at ? formatShortDate(membership.paid_at) : 'No registrada',
      icon: 'receipt-text-check-outline',
    },
  ];

  return (
    <ScreenContainer>
      <AppHeader title={user?.name ?? 'Perfil'} subtitle="Datos de la sesión autenticada." />

      {!user ? (
        <EmptyState
          title="Sin datos de usuario"
          description="Inicia sesión nuevamente para cargar el perfil."
          icon="account-alert-outline"
        />
      ) : null}

      {user ? (
        <>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}>
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.avatarFrame,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.primary,
                  },
                ]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <TextBlock variant="header" color="primary">
                    {initials}
                  </TextBlock>
                )}
              </View>

              <View style={styles.heroText}>
                <TextBlock variant="title" style={styles.heroName}>
                  {user.name}
                </TextBlock>
                <TextBlock variant="body" color="muted" numberOfLines={1}>
                  {user.email}
                </TextBlock>

                <View style={styles.badgeRow}>
                  <StatusBadge icon="shield-account-outline" label={roleLabel} />
                  <StatusBadge
                    icon={user.is_active === false ? 'account-off-outline' : 'account-check-outline'}
                    label={accountStatus}
                    muted={user.is_active === false}
                  />
                </View>
              </View>
            </View>

            <View style={styles.heroStats}>
              <MiniStat label="Plan" value={membership?.plan_label ?? 'Sin membresía'} />
              <MiniStat label="Peso" value={formatMeasurement(user.weight, 'kg')} />
              <MiniStat label="IMC" value={bmi ?? 'No disponible'} />
            </View>
          </View>

          <ProfileSection title="Cuenta" icon="account-circle-outline">
            {accountItems.map((item) => (
              <InfoCard key={item.label} {...item} />
            ))}
          </ProfileSection>

          <ProfileSection title="Datos físicos" icon="arm-flex-outline">
            {physicalItems.map((item) => (
              <InfoCard key={item.label} {...item} />
            ))}
          </ProfileSection>

          <ProfileSection title="Membresía" icon="wallet-membership">
            {membershipItems.map((item) => (
              <InfoCard key={item.label} {...item} />
            ))}
            {membership?.notes ? (
              <InfoCard label="Notas" value={membership.notes} icon="note-text-outline" fullWidth />
            ) : null}
          </ProfileSection>

          {routines.length > 0 ? (
            <ProfileSection title="Rutinas" icon="clipboard-list-outline">
              {routines.map((routine) => (
                <InfoCard
                  key={routine.id}
                  label={routine.is_predefined ? 'Rutina predefinida' : 'Rutina personalizada'}
                  value={routine.name}
                  detail={routine.description ?? 'Sin descripción'}
                  icon="dumbbell"
                  fullWidth
                />
              ))}
            </ProfileSection>
          ) : null}
        </>
      ) : null}

      <Pressable
        onPress={() => void logout()}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          pressed && styles.pressed,
        ]}>
        <MaterialCommunityIcons name="logout" size={20} color={theme.colors.primary} />
        <TextBlock variant="button" color="primary">
          Cerrar sesión
        </TextBlock>
      </Pressable>
    </ScreenContainer>
  );
}

type StatusBadgeProps = {
  icon: IconName;
  label: string;
  muted?: boolean;
};

function StatusBadge({ icon, label, muted = false }: StatusBadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
      ]}>
      <MaterialCommunityIcons
        name={icon}
        size={15}
        color={muted ? theme.colors.textMuted : theme.colors.primary}
      />
      <TextBlock variant="caption" color={muted ? 'muted' : 'primary'} numberOfLines={1}>
        {label}
      </TextBlock>
    </View>
  );
}

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.miniStat,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
      ]}>
      <TextBlock variant="caption" color="muted">
        {label}
      </TextBlock>
      <TextBlock variant="button" numberOfLines={1}>
        {value}
      </TextBlock>
    </View>
  );
}

type ProfileSectionProps = {
  title: string;
  icon: IconName;
  children: ReactNode;
};

function ProfileSection({ title, icon, children }: ProfileSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <TextBlock variant="eyebrow" color="muted">
          {title}
        </TextBlock>
        <View style={[styles.sectionLine, { backgroundColor: theme.colors.border }]} />
      </View>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

type InfoCardProps = ProfileItem & {
  fullWidth?: boolean;
};

function InfoCard({ label, value, detail, icon, fullWidth = false }: InfoCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.itemCard,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}>
      <View style={styles.itemTop}>
        <View style={[styles.itemIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <TextBlock variant="caption" color="muted" style={styles.itemLabel}>
          {label}
        </TextBlock>
      </View>
      <TextBlock variant="title" style={styles.itemValue}>
        {value}
      </TextBlock>
      {detail ? (
        <TextBlock variant="caption" color="subtle">
          {detail}
        </TextBlock>
      ) : null}
    </View>
  );
}

function getInitials(name?: string | null) {
  if (!name) return 'U';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function calculateAge(value?: string | null) {
  if (!value) return null;

  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return `${age} años`;
}

function calculateBmi(height?: string | number | null, weight?: string | number | null) {
  const heightValue = Number(height);
  const weightValue = Number(weight);

  if (!heightValue || !weightValue) return null;

  const heightInMeters = heightValue > 3 ? heightValue / 100 : heightValue;
  const bmi = weightValue / (heightInMeters * heightInMeters);

  if (!Number.isFinite(bmi)) return null;

  return bmi.toFixed(1);
}

function formatMeasurement(value?: string | number | null, unit?: string) {
  if (value === null || value === undefined || value === '') return 'No registrado';

  return `${value}${unit ? ` ${unit}` : ''}`;
}

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return 'No registrado';

  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatGender(value?: string | null) {
  if (!value) return 'No registrado';

  const labels: Record<string, string> = {
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
  };

  return labels[value] ?? value;
}

function formatMembershipStatus(value?: string | null) {
  if (!value) return 'No registrada';

  const labels: Record<string, string> = {
    active: 'Activa',
    expired: 'Vencida',
    cancelled: 'Cancelada',
  };

  return labels[value] ?? value;
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 4,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarFrame: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  heroName: {
    fontSize: 22,
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    minHeight: 30,
    maxWidth: '100%',
    borderRadius: DIMENSIONS.chipRadius,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  miniStat: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 64,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 3,
  },
  section: {
    marginTop: 22,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 118,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 1,
  },
  fullWidth: {
    flexBasis: '100%',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
  },
  itemValue: {
    fontSize: 17,
    lineHeight: 23,
  },
  logoutButton: {
    marginTop: 22,
    minHeight: 52,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
