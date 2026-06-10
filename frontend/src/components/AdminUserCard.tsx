import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import type { AdminUser } from '@/interfaces/admin';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/dates';
import { TextBlock } from './TextBlock';

type AdminUserCardProps = {
  user: AdminUser;
  onPress?: () => void;
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

function AdminUserCardBase({ user, onPress }: AdminUserCardProps) {
  const theme = useTheme();
  const role = user.role?.slug ?? 'user';
  const membership = user.latest_membership;
  const genderLabel = user.gender ? GENDER_LABELS[user.gender] ?? user.gender : 'Sin registrar';
  const personalInfo = [
    {
      icon: 'phone-outline',
      label: 'Telefono',
      value: formatOptional(user.phone),
    },
    {
      icon: 'calendar-account-outline',
      label: 'Nacimiento',
      value: formatShortDate(user.birth_date ?? null),
    },
    {
      icon: 'gender-male-female',
      label: 'Genero',
      value: genderLabel,
    },
    {
      icon: 'human-male-height',
      label: 'Estatura',
      value: formatMeasurement(user.height, ' cm'),
    },
    {
      icon: 'weight-kilogram',
      label: 'Peso',
      value: formatMeasurement(user.weight, ' kg'),
    },
    {
      icon: 'card-account-details-outline',
      label: 'ID',
      value: String(user.id),
    },
  ] as const;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        <View style={styles.textGroup}>
          <TextBlock variant="title">{user.name}</TextBlock>
          <TextBlock variant="caption" color="muted">
            {user.email}
          </TextBlock>
          {user.username ? (
            <TextBlock variant="caption" color="subtle">
              @{user.username}
            </TextBlock>
          ) : null}
        </View>

        <View style={[styles.badge, { backgroundColor: theme.colors.surfaceElevated }]}>
          <TextBlock variant="caption" color={role === 'admin' ? 'primary' : 'muted'}>
            {role}
          </TextBlock>
        </View>
      </View>

      <View style={styles.infoGrid}>
        {personalInfo.map((item) => (
          <View
            key={item.label}
            style={[
              styles.infoItem,
              { backgroundColor: theme.colors.surfaceElevated },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={17}
              color={theme.colors.textSubtle}
            />
            <View style={styles.infoText}>
              <TextBlock variant="caption" color="subtle">
                {item.label}
              </TextBlock>
              <TextBlock variant="caption" color="muted" numberOfLines={1}>
                {item.value}
              </TextBlock>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons
            name={user.is_active === false ? 'close-circle-outline' : 'check-circle-outline'}
            size={18}
            color={user.is_active === false ? theme.colors.danger : theme.colors.primary}
          />
          <TextBlock variant="caption" color={user.is_active === false ? 'subtle' : 'muted'}>
            {user.is_active === false ? 'Inactivo' : 'Activo'}
          </TextBlock>
        </View>
        <View style={styles.metaItem}>
          <TextBlock variant="caption" color="subtle">
            Plan
          </TextBlock>
          <TextBlock variant="caption" color="muted">
            {membership?.plan_label ?? membership?.plan_type ?? 'Sin membresia'}
          </TextBlock>
        </View>
        <View style={styles.metaItem}>
          <TextBlock variant="caption" color="subtle">
            Vence
          </TextBlock>
          <TextBlock variant="caption" color="muted">
            {formatShortDate(membership?.ends_at ?? null)}
          </TextBlock>
        </View>
      </View>
    </Pressable>
  );
}

export const AdminUserCard = memo(AdminUserCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    minWidth: 150,
    flexGrow: 1,
    flexBasis: '31%',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
