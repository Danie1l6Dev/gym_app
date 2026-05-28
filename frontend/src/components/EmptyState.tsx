import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from './TextBlock';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
  footer?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon = 'dumbbell',
  footer,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}>
      <View style={[styles.iconBadge, { backgroundColor: theme.colors.surfaceElevated }]}>
        <MaterialCommunityIcons name={icon} size={28} color={theme.colors.primary} />
      </View>
      <View style={styles.textGroup}>
        <TextBlock variant="title">{title}</TextBlock>
        <TextBlock variant="body" color="muted" style={styles.description}>
          {description}
        </TextBlock>
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}>
          <MaterialCommunityIcons name="refresh" size={18} color={theme.colors.primary} />
          <TextBlock variant="button" color="primary">
            {actionLabel}
          </TextBlock>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    gap: 8,
  },
  description: {
    maxWidth: 540,
  },
  footer: {
    marginTop: 4,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
