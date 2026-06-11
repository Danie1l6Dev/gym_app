import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import type { AdminMembership } from '@/interfaces/admin';
import { useTheme } from '@/hooks/use-theme';
import { daysUntil, formatShortDate } from '@/utils/dates';
import { TextBlock } from './TextBlock';

type MembershipCardProps = {
  membership: AdminMembership;
  onPress?: () => void;
};

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

function resolvePlanLabel(membership: AdminMembership) {
  return membership.plan_label ?? membership.plan_type ?? 'Plan';
}

function resolveDaysText(days: number | null) {
  if (days === null) {
    return 'Sin fecha';
  }

  if (days < 0) {
    return `Vencio hace ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`;
  }

  if (days === 0) {
    return 'Vence hoy';
  }

  return `Vence en ${days} dia${days === 1 ? '' : 's'}`;
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.detailItem, { backgroundColor: theme.colors.surfaceElevated }]}>
      <MaterialCommunityIcons name={icon} size={17} color={theme.colors.textSubtle} />
      <View style={styles.detailText}>
        <TextBlock variant="caption" color="subtle">
          {label}
        </TextBlock>
        <TextBlock variant="caption" color="muted" numberOfLines={2}>
          {value}
        </TextBlock>
      </View>
    </View>
  );
}

function MembershipCardBase({ membership, onPress }: MembershipCardProps) {
  const theme = useTheme();
  const remainingDays = daysUntil(membership.ends_at ?? null);
  const isUrgent = remainingDays !== null && remainingDays <= 7;
  const statusTone = isUrgent ? theme.colors.danger : theme.colors.primary;
  const user = membership.user;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: isUrgent ? statusTone : theme.colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.textGroup}>
          <TextBlock
            variant="eyebrow"
            color={isUrgent ? 'default' : 'primary'}
            style={isUrgent ? { color: theme.colors.danger } : undefined}
          >
            {resolveDaysText(remainingDays)}
          </TextBlock>
          <TextBlock variant="title">{user?.name ?? 'Cliente sin nombre'}</TextBlock>
          <TextBlock variant="caption" color="muted">
            {user?.email ?? 'Sin correo'}{user?.username ? ` · @${user.username}` : ''}
          </TextBlock>
        </View>

        <View style={[styles.badge, { backgroundColor: `${statusTone}22`, borderColor: statusTone }]}>
          <TextBlock
            variant="caption"
            color={isUrgent ? 'default' : 'primary'}
            style={isUrgent ? { color: theme.colors.danger } : undefined}
          >
            {membership.status ?? 'active'}
          </TextBlock>
        </View>
      </View>

      <View style={styles.planBand}>
        <View style={styles.planTitle}>
          <MaterialCommunityIcons name="credit-card-outline" size={20} color={theme.colors.primary} />
          <TextBlock variant="body">{resolvePlanLabel(membership)}</TextBlock>
        </View>
        <TextBlock variant="body" color="muted">
          {formatPrice(membership.price)}
        </TextBlock>
      </View>

      <View style={styles.detailGrid}>
        <DetailItem icon="phone-outline" label="Telefono" value={user?.phone ?? 'Sin registrar'} />
        <DetailItem icon="calendar-start" label="Inicio" value={formatShortDate(membership.starts_at ?? null)} />
        <DetailItem icon="calendar-end" label="Vencimiento" value={formatShortDate(membership.ends_at ?? null)} />
        <DetailItem icon="calendar-check-outline" label="Pago" value={formatShortDate(membership.paid_at ?? null)} />
        <DetailItem icon="account-check-outline" label="Cliente" value={user?.is_active === false ? 'Usuario inactivo' : 'Usuario activo'} />
        <DetailItem icon="note-text-outline" label="Notas" value={membership.notes ?? 'Sin notas'} />
      </View>
    </Pressable>
  );
}

export const MembershipCard = memo(MembershipCardBase);

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
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  planBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  planTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
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
  detailText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
