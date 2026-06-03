import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import type { AdminMembership } from '@/interfaces/admin';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/dates';
import { TextBlock } from './TextBlock';

type MembershipCardProps = {
  membership: AdminMembership;
  onPress?: () => void;
};

function MembershipCardBase({ membership, onPress }: MembershipCardProps) {
  const theme = useTheme();
  const statusTone = membership.status === 'active' ? theme.colors.primary : theme.colors.accent;
  const planLabel = membership.plan_label ?? resolvePlanLabel(membership.plan_type);

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
          <TextBlock variant="title">{planLabel}</TextBlock>
          <TextBlock variant="caption" color="muted">
            {membership.user?.name ?? 'Usuario'}
          </TextBlock>
        </View>

        <View style={[styles.badge, { backgroundColor: theme.colors.surfaceElevated, borderColor: statusTone }]}>
          <TextBlock variant="caption" color={membership.status === 'active' ? 'primary' : 'muted'}>
            {membership.status ?? 'unknown'}
          </TextBlock>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="calendar-start" size={18} color={theme.colors.secondary} />
          <TextBlock variant="caption" color="muted">
            {formatShortDate(membership.starts_at ?? null)}
          </TextBlock>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="calendar-end" size={18} color={statusTone} />
          <TextBlock variant="caption" color="muted">
            {formatShortDate(membership.ends_at ?? null)}
          </TextBlock>
        </View>
      </View>
    </Pressable>
  );
}

export const MembershipCard = memo(MembershipCardBase);

function resolvePlanLabel(planType?: string | null) {
  if (planType === 'weekly') {
    return 'Semanal';
  }

  if (planType === 'monthly') {
    return 'Mensual';
  }

  return 'Plan';
}

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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
