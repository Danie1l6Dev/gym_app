import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { DIMENSIONS } from '@/constants';
import type { AdminUser } from '@/interfaces/admin';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/dates';
import { TextBlock } from './TextBlock';

type AdminUserCardProps = {
  user: AdminUser;
  onPress?: () => void;
};

function AdminUserCardBase({ user, onPress }: AdminUserCardProps) {
  const theme = useTheme();
  const role = user.role?.slug ?? 'user';
  const membership = user.latest_membership;

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
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
